import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeTotals } from "./format";

const itemSchema = z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(20) });

const orderSchema = z.object({
  items: z.array(itemSchema).min(1).max(20),
  coupon_code: z.string().trim().max(40).optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().max(30).optional().nullable(),
    cpf: z.string().trim().max(20).optional().nullable(),
  }),
  shipping: z.object({
    cep: z.string().trim().min(8).max(9),
    street: z.string().trim().min(2).max(160),
    number: z.string().trim().min(1).max(20),
    complement: z.string().trim().max(80).optional().nullable(),
    district: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(2),
  }),
});

type CouponRow = {
  id: string;
  code: string;
  percent_off: number | null;
  amount_off_cents: number | null;
  min_order_cents: number;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  uses: number;
  active: boolean;
};

function couponError(c: CouponRow | null, subtotal: number): string | null {
  if (!c) return "Cupom não encontrado.";
  if (!c.active) return "Cupom inativo.";
  const now = Date.now();
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return "Cupom ainda não está válido.";
  if (c.ends_at && new Date(c.ends_at).getTime() < now) return "Cupom expirado.";
  if (c.max_uses !== null && c.uses >= c.max_uses) return "Cupom esgotado.";
  if (subtotal < c.min_order_cents) return "Pedido não atinge o valor mínimo do cupom.";
  return null;
}

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ code: z.string().trim().min(1).max(40), subtotal_cents: z.number().int().min(0) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .ilike("code", data.code)
      .maybeSingle();
    const error = couponError(coupon as CouponRow | null, data.subtotal_cents);
    if (error || !coupon) return { valid: false as const, error: error ?? "Cupom inválido." };
    return {
      valid: true as const,
      code: coupon.code,
      percent_off: coupon.percent_off ? Number(coupon.percent_off) : null,
      amount_off_cents: coupon.amount_off_cents ?? null,
      description: coupon.description ?? null,
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. preços e estoque vêm SEMPRE do banco
    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("id, sku, name, price_cents, sale_price_cents, stock, reserved_stock, active")
      .in("id", ids);
    if (prodError) throw new Error("Não foi possível carregar os produtos.");

    const lines = data.items.map((item) => {
      const p = products?.find((x) => x.id === item.product_id);
      if (!p || !p.active) throw new Error("Produto indisponível no carrinho.");
      const available = p.stock - (p.reserved_stock ?? 0);
      if (available < item.quantity) throw new Error(`Estoque insuficiente para ${p.name}.`);
      const unit = p.sale_price_cents && p.sale_price_cents > 0 ? p.sale_price_cents : p.price_cents;
      return { product: p, quantity: item.quantity, unit_price_cents: unit };
    });


    // 2. promoção por quantidade (regra administrável)
    const { data: promo } = await supabaseAdmin
      .from("promotions")
      .select("min_quantity, percent_off")
      .eq("active", true)
      .order("min_quantity")
      .limit(1)
      .maybeSingle();

    // 3. cupom
    let couponRow: CouponRow | null = null;
    const subtotalRaw = lines.reduce((s, l) => s + l.quantity * l.unit_price_cents, 0);
    if (data.coupon_code) {
      const { data: c } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .ilike("code", data.coupon_code)
        .maybeSingle();
      const err = couponError(c as CouponRow | null, subtotalRaw);
      if (err) throw new Error(err);
      couponRow = c as CouponRow;
    }

    const totals = computeTotals(lines, {
      promoMinQty: promo?.min_quantity ?? 2,
      promoPercent: promo ? Number(promo.percent_off) : 10,
      couponPercent: couponRow?.percent_off ? Number(couponRow.percent_off) : undefined,
      couponAmountCents: couponRow?.amount_off_cents ?? undefined,
    });

    // 4. frete: configurável, sem valor inventado
    const { data: shippingSetting } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "shipping")
      .maybeSingle();
    const shippingCents = Number((shippingSetting?.value as any)?.flat_cents ?? 0);

    const { data: numberRow } = await supabaseAdmin.rpc("next_order_number");
    const orderNumber = (numberRow as string | null) ?? `NUVE-${Date.now()}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: data.user_id ?? null,
        customer_name: data.customer.name,
        customer_email: data.customer.email,
        customer_phone: data.customer.phone ?? null,
        customer_cpf: data.customer.cpf ?? null,
        shipping: data.shipping,
        subtotal_cents: totals.subtotal,
        promo_discount_cents: totals.promoDiscount,
        coupon_discount_cents: totals.couponDiscount,
        shipping_cents: shippingCents,
        total_cents: totals.total + shippingCents,
        coupon_code: couponRow?.code ?? null,
        status: "aguardando_pagamento",
        payment_status: "aguardando",
      })
      .select("id, order_number, total_cents")
      .single();
    if (orderError || !order) throw new Error("Não foi possível criar o pedido.");

    await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        sku: l.product.sku,
        name: l.product.name,
        unit_price_cents: l.unit_price_cents,
        quantity: l.quantity,
        total_cents: l.unit_price_cents * l.quantity,
      })),
    );

    // 5. reserva atômica de estoque (evita vender acima do limite com pedidos simultâneos)
    const reserved: typeof lines = [];
    for (const l of lines) {
      const { data: ok, error: reserveError } = await supabaseAdmin.rpc("reserve_stock", {
        _product_id: l.product.id,
        _qty: l.quantity,
      });
      if (reserveError || ok !== true) {
        for (const r of reserved) {
          await supabaseAdmin.rpc("reserve_stock", { _product_id: r.product.id, _qty: -r.quantity });
        }
        await supabaseAdmin.from("order_items").delete().eq("order_id", order.id);
        await supabaseAdmin.from("orders").delete().eq("id", order.id);
        throw new Error(`Estoque insuficiente para ${l.product.name}.`);
      }
      reserved.push(l);
      await supabaseAdmin.from("inventory_movements").insert({
        product_id: l.product.id,
        delta: 0,
        reason: `reserva do pedido ${order.order_number}`,
        movement_type: "reserva",
        order_id: order.id,
        stock_after: l.product.stock,
        note: `${l.quantity} un. reservadas até a confirmação do pagamento`,
      });
    }
    await supabaseAdmin.from("orders").update({ stock_state: "reservado" }).eq("id", order.id);


    await supabaseAdmin.from("payments").insert({
      order_id: order.id,
      provider: "mercadopago",
      status: "aguardando",
      amount_cents: order.total_cents,
    });

    if (couponRow) {
      await supabaseAdmin
        .from("coupons")
        .update({ uses: couponRow.uses + 1 })
        .eq("id", couponRow.id);
      await supabaseAdmin.from("coupon_usage").insert({
        coupon_id: couponRow.id,
        order_id: order.id,
        customer_email: data.customer.email,
      });
    }

    return { order_id: order.id, order_number: order.order_number, total_cents: order.total_cents };
  });

export const getOrderPublic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ order_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, status, payment_status, subtotal_cents, promo_discount_cents, coupon_discount_cents, shipping_cents, total_cents, coupon_code, created_at, customer_name, order_items(name, sku, quantity, unit_price_cents, total_cents)",
      )
      .eq("id", data.order_id)
      .maybeSingle();
    return order ?? null;
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().email().max(160) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("newsletter_subscribers").upsert({ email: data.email }, { onConflict: "email" });
    return { ok: true };
  });
