import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Painel NUVE" },
      { name: "description", content: "Gestão de preços, estoque e status dos produtos NUVE." },
      { property: "og:title", content: "Produtos — Painel NUVE" },
      { property: "og:description", content: "Gestão de catálogo." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminProdutos,
});

function AdminProdutos() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, sku, price_cents, sale_price_cents, stock, active, featured")
        .order("sort_order");
      return data ?? [];
    },
  });
  const [draft, setDraft] = useState<Record<string, { price: string; stock: string }>>({});

  async function save(p: any) {
    const d = draft[p.id];
    const price = d?.price ? Math.round(parseFloat(d.price.replace(",", ".")) * 100) : p.price_cents;
    const stock = d?.stock ? parseInt(d.stock, 10) : p.stock;
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      toast.error("Valores inválidos.");
      return;
    }
    const { error } = await supabase.from("products").update({ price_cents: price, stock }).eq("id", p.id);
    if (error) {
      toast.error("Sem permissão ou erro ao salvar.");
      return;
    }
    toast.success("Produto atualizado.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function toggle(p: any, field: "active" | "featured") {
    const patch = field === "active" ? { active: !p.active } : { featured: !p.featured };
    const { error } = await supabase.from("products").update(patch).eq("id", p.id);
    if (error) {
      toast.error("Não foi possível atualizar.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">Produtos</h1>
      <div className="space-y-4">
        {(data ?? []).map((p: any) => (
          <div key={p.id} className="grid gap-3 border border-border bg-card p-5 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
            <div>
              <p className="font-display text-xl text-ink">{p.name}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ash">
                {p.sku} · atual {brl(p.price_cents)}
              </p>
            </div>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Preço (R$)</span>
              <input
                defaultValue={(p.price_cents / 100).toFixed(2)}
                onChange={(e) => setDraft((d) => ({ ...d, [p.id]: { ...d[p.id], price: e.target.value, stock: d[p.id]?.stock ?? "" } }))}
                className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Estoque</span>
              <input
                defaultValue={p.stock}
                onChange={(e) => setDraft((d) => ({ ...d, [p.id]: { ...d[p.id], stock: e.target.value, price: d[p.id]?.price ?? "" } }))}
                className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => save(p)} className="bg-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory">
                Salvar
              </button>
              <button type="button" onClick={() => toggle(p, "active")} className="border border-input px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ash">
                {p.active ? "Ativo" : "Inativo"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
