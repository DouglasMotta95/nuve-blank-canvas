import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria — Painel NUVE" },
      { name: "description", content: "Registro completo de quem alterou o estoque, quando e por quê." },
      { property: "og:title", content: "Auditoria — Painel NUVE" },
      { property: "og:description", content: "Histórico auditável das movimentações de estoque." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAuditoria,
});

const TYPE_LABEL: Record<string, string> = {
  ajuste: "Ajuste manual",
  reserva: "Reserva",
  venda: "Venda",
};

function AdminAuditoria() {
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin-audit-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name").order("sort_order");
      return data ?? [];
    },
  });

  const { data: rows } = useQuery({
    queryKey: ["admin-audit", filter],
    queryFn: async () => {
      let q = supabase
        .from("inventory_movements")
        .select(
          "id, product_id, delta, reason, note, movement_type, created_by_email, stock_after, order_id, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (filter !== "todos") q = q.eq("movement_type", filter);
      const { data } = await q;
      return data ?? [];
    },
  });

  const nameById = new Map((products ?? []).map((p: any) => [p.id, p.name]));
  const term = search.trim().toLowerCase();
  const list = (rows ?? []).filter((r: any) => {
    if (!term) return true;
    return [nameById.get(r.product_id), r.reason, r.note, r.created_by_email]
      .filter(Boolean)
      .some((v: any) => String(v).toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Auditoria de estoque</h1>
        <p className="mt-1 text-sm text-ash">
          Toda movimentação fica registrada: quem alterou, quando, o motivo e o saldo depois da alteração.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {["todos", "ajuste", "reserva", "venda"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className={`border px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${
              filter === t ? "border-ink bg-ink text-ivory" : "border-input text-ash hover:border-ink hover:text-ink"
            }`}
          >
            {t === "todos" ? "Todos" : TYPE_LABEL[t]}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por produto, motivo ou responsável"
          className="min-w-[240px] flex-1 border border-input bg-ivory px-3 py-2 text-sm"
        />
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-ash">Nenhum registro encontrado.</p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream/70 text-[11px] uppercase tracking-[0.14em] text-ash">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Variação</th>
                <th className="px-4 py-3">Saldo depois</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r: any) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 text-ash">
                    {new Date(r.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-ink">{nameById.get(r.product_id) ?? "—"}</td>
                  <td className="px-4 py-3 text-ash">{TYPE_LABEL[r.movement_type] ?? r.movement_type}</td>
                  <td className={`px-4 py-3 ${r.delta > 0 ? "text-ink" : r.delta < 0 ? "text-destructive" : "text-ash"}`}>
                    {r.delta > 0 ? `+${r.delta}` : r.delta}
                  </td>
                  <td className="px-4 py-3 text-ash">{r.stock_after ?? "—"}</td>
                  <td className="px-4 py-3 text-ash">{r.created_by_email ?? "sistema"}</td>
                  <td className="px-4 py-3 text-ash">
                    {r.reason}
                    {r.note ? <span className="block text-[11px] text-ash/80">{r.note}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
