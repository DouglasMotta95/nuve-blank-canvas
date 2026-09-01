import { createFileRoute, Link } from "@tanstack/react-router";
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

const OPEN_STATUS = ["aguardando_pagamento", "pagamento_aprovado", "em_separacao"];

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [orders, products] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total_cents, payment_status, status, created_at, order_number, customer_name")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id, name, stock, active").order("sort_order"),
      ]);
      return { orders: orders.data ?? [], products: products.data ?? [] };
    },
  });

  const orders = data?.orders ?? [];
  const products = data?.products ?? [];
  const paid = orders.filter((o: any) => o.payment_status === "aprovado");
  const revenue = paid.reduce((s: number, o: any) => s + o.total_cents, 0);
  const ticket = paid.length ? Math.round(revenue / paid.length) : 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthRevenue = paid
    .filter((o: any) => new Date(o.created_at) >= monthStart)
    .reduce((s: number, o: any) => s + o.total_cents, 0);

  const pending = orders.filter((o: any) => OPEN_STATUS.includes(o.status));
  const lowStock = products.filter((p: any) => p.stock <= 10);
  const units = products.reduce((s: number, p: any) => s + p.stock, 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Visão geral</h1>
          <p className="mt-1 text-sm text-ash">Resumo da operação da loja NUVE.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/estoque" className="bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory">
            Lançar estoque
          </Link>
          <Link to="/admin/pedidos" className="border border-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-ink">
            Ver pedidos
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Faturamento aprovado" value={brl(revenue)} hint={`Mês atual ${brl(monthRevenue)}`} />
        <Card label="Pedidos" value={String(orders.length)} hint={`${paid.length} pagos`} />
        <Card label="Ticket médio" value={brl(ticket)} hint="Somente pedidos pagos" />
        <Card
          label="Estoque total"
          value={`${units} un.`}
          hint={lowStock.length ? `${lowStock.length} produto(s) em alerta` : "Todos com folga"}
          alert={lowStock.length > 0}
        />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl text-ink">A processar</h2>
          {pending.length === 0 ? (
            <p className="mt-2 text-sm text-ash">Nenhum pedido em aberto.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {pending.slice(0, 8).map((o: any) => (
                <li key={o.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span className="text-ash">
                    {o.order_number} · {o.customer_name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.14em] text-clay">
                    {o.status.replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl text-ink">Estoque por produto</h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {products.map((p: any) => (
              <li key={p.id} className="flex justify-between py-3 text-sm">
                <span className="text-ash">
                  {p.name}
                  {!p.active && <span className="ml-2 text-[11px] uppercase tracking-[0.14em]">inativo</span>}
                </span>
                <span className={p.stock <= 10 ? "text-destructive" : "text-ink"}>{p.stock} un.</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Últimos pedidos</h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {orders.slice(0, 8).map((o: any) => (
            <li key={o.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <span className="text-ash">
                {o.order_number} · {o.customer_name}
              </span>
              <span className="text-ink">{brl(o.total_cents)}</span>
            </li>
          ))}
          {orders.length === 0 && <li className="py-3 text-sm text-ash">Nenhum pedido ainda.</li>}
        </ul>
      </section>
    </div>
  );
}

function Card({ label, value, hint, alert }: { label: string; value: string; hint?: string; alert?: boolean }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-ash">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      {hint && <p className={`mt-1 text-[11px] uppercase tracking-[0.14em] ${alert ? "text-destructive" : "text-ash"}`}>{hint}</p>}
    </div>
  );
}
