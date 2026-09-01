-- 1. Reserva de estoque
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reserved_stock integer NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stock_state text NOT NULL DEFAULT 'none';

-- 2. Auditoria de movimentações
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS created_by_email text;
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS order_id uuid;
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS stock_after integer;
ALTER TABLE public.inventory_movements ADD COLUMN IF NOT EXISTS movement_type text NOT NULL DEFAULT 'ajuste';

-- 3. Linha do tempo do pedido
CREATE TABLE IF NOT EXISTS public.order_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  payment_status text,
  tracking_code text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_status_events_order_idx ON public.order_status_events(order_id, created_at);

GRANT SELECT ON public.order_status_events TO authenticated;
GRANT ALL ON public.order_status_events TO service_role;
ALTER TABLE public.order_status_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own order events" ON public.order_status_events
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_status_events.order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
));

-- 4. Reserva atômica
CREATE OR REPLACE FUNCTION public.reserve_stock(_product_id uuid, _qty integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE updated integer;
BEGIN
  UPDATE public.products
  SET reserved_stock = reserved_stock + _qty
  WHERE id = _product_id
    AND active
    AND (stock - reserved_stock) >= _qty;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

-- 5. Liquidação da reserva (consumo ou liberação)
CREATE OR REPLACE FUNCTION public.settle_order_stock(_order_id uuid, _mode text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_state text;
  item record;
  new_stock integer;
BEGIN
  SELECT stock_state INTO current_state FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF current_state IS NULL OR current_state <> 'reservado' THEN
    RETURN coalesce(current_state, 'none');
  END IF;

  FOR item IN
    SELECT product_id, quantity FROM public.order_items
    WHERE order_id = _order_id AND product_id IS NOT NULL
  LOOP
    IF _mode = 'consumir' THEN
      UPDATE public.products
      SET stock = greatest(stock - item.quantity, 0),
          reserved_stock = greatest(reserved_stock - item.quantity, 0)
      WHERE id = item.product_id
      RETURNING stock INTO new_stock;

      INSERT INTO public.inventory_movements (product_id, delta, reason, movement_type, order_id, stock_after, note)
      VALUES (item.product_id, -item.quantity, 'venda confirmada', 'venda', _order_id, new_stock,
              'baixa automática após confirmação de pagamento');
    ELSE
      UPDATE public.products
      SET reserved_stock = greatest(reserved_stock - item.quantity, 0)
      WHERE id = item.product_id
      RETURNING stock INTO new_stock;

      INSERT INTO public.inventory_movements (product_id, delta, reason, movement_type, order_id, stock_after, note)
      VALUES (item.product_id, 0, 'reserva liberada', 'reserva', _order_id, new_stock,
              'pedido cancelado ou não pago');
    END IF;
  END LOOP;

  UPDATE public.orders
  SET stock_state = CASE WHEN _mode = 'consumir' THEN 'consumido' ELSE 'liberado' END
  WHERE id = _order_id;

  RETURN CASE WHEN _mode = 'consumir' THEN 'consumido' ELSE 'liberado' END;
END;
$$;

-- 6. Linha do tempo + liquidação automática por trigger
CREATE OR REPLACE FUNCTION public.track_order_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_events (order_id, status, payment_status, note)
    VALUES (NEW.id, NEW.status, NEW.payment_status, 'pedido criado');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.tracking_code IS DISTINCT FROM OLD.tracking_code THEN
    INSERT INTO public.order_status_events (order_id, status, payment_status, tracking_code)
    VALUES (NEW.id, NEW.status, NEW.payment_status, NEW.tracking_code);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS track_order_status_ins ON public.orders;
CREATE TRIGGER track_order_status_ins AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.track_order_status();

DROP TRIGGER IF EXISTS track_order_status_upd ON public.orders;
CREATE TRIGGER track_order_status_upd AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.track_order_status();

CREATE OR REPLACE FUNCTION public.settle_stock_on_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.stock_state = 'reservado' THEN
    IF NEW.payment_status = 'aprovado' THEN
      PERFORM public.settle_order_stock(NEW.id, 'consumir');
    ELSIF NEW.status = 'cancelado' OR NEW.payment_status IN ('cancelado', 'recusado', 'reembolsado') THEN
      PERFORM public.settle_order_stock(NEW.id, 'liberar');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS settle_stock_on_status_trg ON public.orders;
CREATE TRIGGER settle_stock_on_status_trg AFTER UPDATE OF status, payment_status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.settle_stock_on_status();