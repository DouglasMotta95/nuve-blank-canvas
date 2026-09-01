import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { trackOrder } from "@/lib/orders.functions";
import { OrderTimeline, STATUS_LABEL } from "@/components/site/OrderTimeline";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/rastreio")({
  head: () => ({
    meta: [
      { title: "Rastrear pedido — NUVE Advanced Skin Care" },
      {
        name: "description",
        content:
          "Acompanhe seu pedido NUVE Advanced Skin Care: informe o número do pedido e o e-mail da compra para ver o status e o código de rastreio.",
      },
      { property: "og:title", content: "Rastrear pedido — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Veja o status do seu pedido e o código de rastreio dos Correios." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RastreioPage,
});

function RastreioPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () => trackOrder({ data: { order_number: orderNumber.trim(), email: email.trim() } }),
  });

  const result = mutation.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="eyebrow">Acompanhe sua compra</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Rastrear pedido</h1>
      <p className="mt-3 text-sm text-ash">
        Informe o número do pedido (ex.: NUVE-2026-00001) e o e-mail usado na compra.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        <div>
          <label className="text-[11px] uppercase tracking-[0.16em] text-ash" htmlFor="pedido">
            Número do pedido
          </label>
          <input
            id="pedido"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="NUVE-2026-00001"
            className="mt-1 w-full border border-input bg-ivory px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.16em] text-ash" htmlFor="email">
            E-mail da compra
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="mt-1 w-full border border-input bg-ivory px-4 py-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.2em] text-ivory disabled:opacity-60"
        >
          {mutation.isPending ? "Buscando..." : "Ver status do pedido"}
        </button>
      </form>

      {mutation.isError && (
        <p className="mt-6 text-sm text-destructive">Não foi possível buscar agora. Tente novamente.</p>
      )}

      {result && !result.found && (
        <p className="mt-6 border border-border bg-cream/60 px-4 py-3 text-sm text-ash">
          Não encontramos um pedido com esses dados. Confira o número e o e-mail usados na compra.
        </p>
      )}

      {result?.found && (
        <section className="mt-10 border border-border bg-white/60 p-6">
          <p className="eyebrow">Pedido {result.order.order_number}</p>
          <h2 className="mt-1 font-display text-2xl text-ink">
            {STATUS_LABEL[result.order.status] ?? result.order.status}
          </h2>
          <p className="mt-1 text-sm text-ash">
            Feito em {new Date(result.order.created_at).toLocaleDateString("pt-BR")} · total{" "}
            {brl(result.order.total_cents)}
          </p>

          <div className="mt-6">
            <OrderTimeline
              status={result.order.status}
              trackingCode={result.order.tracking_code}
              events={result.order.events as any}
            />
          </div>

          <ul className="mt-6 divide-y divide-border border-t border-border">
            {(result.order.order_items ?? []).map((i: any) => (
              <li key={i.sku + i.name} className="flex justify-between py-3 text-sm">
                <span className="text-ash">
                  {i.quantity}× {i.name}
                </span>
                <span className="text-ink">{brl(i.total_cents)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
