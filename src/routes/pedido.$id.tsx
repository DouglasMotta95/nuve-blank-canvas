import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getOrderPublic } from "@/lib/orders.functions";
import { brl } from "@/lib/format";
import { OrderTimeline, STATUS_LABEL } from "@/components/site/OrderTimeline";


export const Route = createFileRoute("/pedido/$id")({
  head: () => ({
    meta: [
      { title: "Seu pedido — NUVE Advanced Skin Care" },
      { name: "description", content: "Acompanhe o status do seu pedido NUVE Advanced Skin Care." },
      { property: "og:title", content: "Seu pedido — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Acompanhe o status do seu pedido." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidoPage,
});

const LABEL: Record<string, string> = {
  aguardando: "Aguardando pagamento",
  processando: "Processando pagamento",
  aprovado: "Pagamento aprovado",
  recusado: "Pagamento recusado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

function PedidoPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderPublic({ data: { order_id: id } }),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });


  if (isLoading) return <div className="mx-auto h-[50vh] max-w-2xl animate-pulse bg-cream" />;
  if (!order)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Pedido não encontrado</h1>
        <Link to="/" className="mt-6 inline-block border-b border-clay text-[11px] uppercase tracking-[0.2em] text-clay">
          Voltar à home
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="eyebrow">Pedido {order.order_number}</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Obrigada, {order.customer_name.split(" ")[0]}!</h1>
      <p className="mt-3 text-sm text-ash">
        Status do pedido: <strong className="text-ink">{STATUS_LABEL[order.status] ?? order.status}</strong> ·
        pagamento: <strong className="text-ink">{LABEL[order.payment_status] ?? order.payment_status}</strong>. Esta
        página atualiza sozinha.
      </p>

      <div className="mt-8 border border-border bg-white/60 p-5">
        <OrderTimeline status={order.status} trackingCode={order.tracking_code} events={order.events as any} />
      </div>


      <ul className="mt-8 divide-y divide-border border-y border-border">
        {(order.order_items ?? []).map((i: any) => (
          <li key={i.sku + i.name} className="flex justify-between py-4 text-sm">
            <span className="text-ash">
              {i.quantity}× {i.name}
            </span>
            <span className="text-ink">{brl(i.total_cents)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between text-ash">
          <dt>Subtotal</dt>
          <dd>{brl(order.subtotal_cents)}</dd>
        </div>
        {order.promo_discount_cents > 0 && (
          <div className="flex justify-between text-clay">
            <dt>Desconto 10% (2+)</dt>
            <dd>− {brl(order.promo_discount_cents)}</dd>
          </div>
        )}
        {order.coupon_discount_cents > 0 && (
          <div className="flex justify-between text-clay">
            <dt>Cupom {order.coupon_code}</dt>
            <dd>− {brl(order.coupon_discount_cents)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-3 text-base text-ink">
          <dt>Total</dt>
          <dd>{brl(order.total_cents)}</dd>
        </div>
      </dl>

      <Link to="/loja" className="mt-10 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
        Continuar comprando
      </Link>
    </div>
  );
}
