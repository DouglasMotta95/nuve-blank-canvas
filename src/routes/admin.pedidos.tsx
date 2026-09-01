import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — Painel NUVE" },
      { name: "description", content: "Acompanhe e atualize o status dos pedidos da loja NUVE." },
      { property: "og:title", content: "Pedidos — Painel NUVE" },
      { property: "og:description", content: "Gestão de pedidos e envios." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPedidos,
});

const STATUS = ["aguardando_pagamento", "pagamento_aprovado", "em_separacao", "enviado", "entregue", "cancelado"];

function AdminPedidos() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(name, quantity, total_cents)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string, tracking?: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status, ...(tracking !== undefined ? { tracking_code: tracking } : {}) })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o pedido.");
      return;
    }
    toast.success("Pedido atualizado.");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">Pedidos</h1>
      {(data ?? []).length === 0 && <p className="text-sm text-ash">Nenhum pedido ainda.</p>}
      <div className="space-y-4">
        {(data ?? []).map((o: any) => (
          <article key={o.id} className="border border-border bg-card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-xl text-ink">{o.order_number}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-ash">
                  {o.customer_name} · {o.customer_email}
                </p>
              </div>
              <p className="text-lg text-ink">{brl(o.total_cents)}</p>
            </div>

            <ul className="mt-3 text-sm text-ash">
              {(o.order_items ?? []).map((i: any) => (
                <li key={i.name}>
                  {i.quantity}× {i.name}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-clay">
              Pagamento: {o.payment_status}
            </p>
            <p className="mt-1 text-sm text-ash">
              {o.shipping?.street}, {o.shipping?.number} — {o.shipping?.district}, {o.shipping?.city}/
              {o.shipping?.state} · CEP {o.shipping?.cep}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                defaultValue={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className="border border-input bg-ivory px-3 py-2 text-sm"
              >
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <input
                defaultValue={o.tracking_code ?? ""}
                placeholder="Código de rastreio"
                onBlur={(e) => setStatus(o.id, o.status, e.target.value)}
                className="border border-input bg-ivory px-3 py-2 text-sm"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
