import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Visão geral — Painel NUVE" },
      { name: "description", content: "Resumo de vendas, pedidos e estoque da loja NUVE." },
      { property: "og:title", content: "Visão geral — Painel NUVE" },
      { property: "og:description", content: "Resumo de vendas e estoque." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [orders, products] = await Promise.all([
        supabase.from("orders").select("id, total_cents, payment_status, created_at, order_number, customer_name"),
        supabase.from("products").select("id, name, stock"),
      ]);
      return { orders: orders.data ?? [], products: products.data ?? [] };
    },
  });

  const orders = data?.orders ?? [];
  const paid = orders.filter((o: any) => o.payment_status === "aprovado");
  const revenue = paid.reduce((s: number, o: any) => s + o.total_cents, 0);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-ink">Visão geral</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Faturamento aprovado" value={brl(revenue)} />
        <Card label="Pedidos" value={String(orders.length)} />
        <Card label="Pagos" value={String(paid.length)} />
      </div>

      <section>
        <h2 className="font-display text-2xl text-ink">Estoque</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {(data?.products ?? []).map((p: any) => (
            <li key={p.id} className="flex justify-between py-3 text-sm">
              <span className="text-ash">{p.name}</span>
              <span className={p.stock < 10 ? "text-destructive" : "text-ink"}>{p.stock} un.</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Últimos pedidos</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {orders.slice(0, 8).map((o: any) => (
            <li key={o.id} className="flex justify-between py-3 text-sm">
              <span className="text-ash">
                {o.order_number} · {o.customer_name}
              </span>
              <span className="text-ink">{brl(o.total_cents)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ash">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
