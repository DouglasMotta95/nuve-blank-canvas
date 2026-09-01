import { createFileRoute } from "@tanstack/react-router";

const STATUS_MAP: Record<string, { payment: string; order: string }> = {
  approved: { payment: "aprovado", order: "pagamento_aprovado" },
  authorized: { payment: "processando", order: "aguardando_pagamento" },
  in_process: { payment: "processando", order: "aguardando_pagamento" },
  pending: { payment: "aguardando", order: "aguardando_pagamento" },
  rejected: { payment: "recusado", order: "aguardando_pagamento" },
  cancelled: { payment: "cancelado", order: "cancelado" },
  refunded: { payment: "reembolsado", order: "cancelado" },
  charged_back: { payment: "reembolsado", order: "cancelado" },
};

export const Route = createFileRoute("/api/public/webhooks/mercadopago")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!token) return new Response("payment provider not configured", { status: 503 });

        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("invalid payload", { status: 400 });
        }

        const paymentId = String(payload?.data?.id ?? payload?.id ?? "");
        if (!paymentId) return new Response("ok");

        // Nunca confiamos no corpo do webhook: consultamos o Mercado Pago.
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return new Response("could not verify payment", { status: 202 });

        const payment = (await res.json()) as {
          id: number;
          status: string;
          external_reference?: string;
          transaction_amount?: number;
          currency_id?: string;
        };

        const orderId = payment.external_reference;
        if (!orderId) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id, total_cents")
          .eq("id", orderId)
          .maybeSingle();
        if (!order) return new Response("order not found", { status: 202 });

        const paidCents = Math.round(Number(payment.transaction_amount ?? 0) * 100);
        const currencyOk = !payment.currency_id || payment.currency_id === "BRL";
        const amountOk = paidCents === order.total_cents;

        // Pagamento aprovado só pode aprovar o pedido quando moeda e valor
        // correspondem exatamente ao total autoritativo salvo no banco.
        if (payment.status === "approved" && (!amountOk || !currencyOk)) {
          await supabaseAdmin
            .from("payments")
            .update({
              provider_payment_id: String(payment.id),
              status: "processando",
              raw: payment as any,
              updated_at: new Date().toISOString(),
            })
            .eq("order_id", orderId);

          console.error("Mercado Pago amount mismatch", {
            orderId,
            expectedCents: order.total_cents,
            paidCents,
            currency: payment.currency_id,
          });
          return new Response("payment amount mismatch", { status: 202 });
        }

        const mapped = STATUS_MAP[payment.status] ?? { payment: "processando", order: "aguardando_pagamento" };

        await supabaseAdmin
          .from("payments")
          .update({
            provider_payment_id: String(payment.id),
            status: mapped.payment,
            raw: payment as any,
            updated_at: new Date().toISOString(),
          })
          .eq("order_id", orderId);

        await supabaseAdmin
          .from("orders")
          .update({ payment_status: mapped.payment, status: mapped.order, updated_at: new Date().toISOString() })
          .eq("id", orderId);

        return new Response("ok");
      },
    },
  },
});
