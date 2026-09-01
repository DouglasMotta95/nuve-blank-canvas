import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Mercado Pago — criação de preferência de checkout.
 * O ACCESS TOKEN vive apenas no servidor (secret MERCADOPAGO_ACCESS_TOKEN).
 */
export const createMercadoPagoCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ order_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, total_cents, customer_email, customer_name")
      .eq("id", data.order_id)
      .maybeSingle();
    if (!order) throw new Error("Pedido não encontrado.");

    if (!token) {
      return {
        configured: false as const,
        message:
          "Integração Mercado Pago implementada — aguardando configuração das credenciais (ACCESS TOKEN).",
      };
    }

    if (!Number.isInteger(order.total_cents) || order.total_cents <= 0) {
      throw new Error("Total do pedido inválido.");
    }

    const siteUrl = process.env["SITE_URL"] ?? "";
    const body = {
      external_reference: order.id,
      // O Mercado Pago recebe o total já calculado e validado no servidor,
      // incluindo desconto, cupom e frete. Assim o valor cobrado nunca diverge
      // do total gravado no pedido.
      items: [
        {
          id: order.order_number,
          title: `Pedido ${order.order_number} — NUVE Advanced Skin Care`,
          quantity: 1,
          unit_price: order.total_cents / 100,
          currency_id: "BRL",
        },
      ],
      payer: { email: order.customer_email, name: order.customer_name },
      back_urls: siteUrl
        ? {
            success: `${siteUrl}/pedido/${order.id}?status=aprovado`,
            pending: `${siteUrl}/pedido/${order.id}?status=pendente`,
            failure: `${siteUrl}/pedido/${order.id}?status=recusado`,
          }
        : undefined,
      auto_return: siteUrl ? "approved" : undefined,
      notification_url: siteUrl ? `${siteUrl}/api/public/webhooks/mercadopago` : undefined,
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Idempotency-Key": order.id,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Mercado Pago preference error", res.status, await res.text());
      return { configured: true as const, error: "Não foi possível iniciar o pagamento agora." };
    }

    const pref = (await res.json()) as { id: string; init_point?: string; sandbox_init_point?: string };
    await supabaseAdmin
      .from("payments")
      .update({ provider_preference_id: pref.id, status: "processando" })
      .eq("order_id", order.id);

    return {
      configured: true as const,
      checkout_url: pref.init_point ?? pref.sandbox_init_point ?? null,
      preference_id: pref.id,
    };
  });
