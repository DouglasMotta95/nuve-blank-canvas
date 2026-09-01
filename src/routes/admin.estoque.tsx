import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Painel NUVE" },
      { name: "description", content: "Entrada, baixa e histórico de estoque dos produtos NUVE." },
      { property: "og:title", content: "Estoque — Painel NUVE" },
      { property: "og:description", content: "Controle de estoque da loja." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminEstoque,
});

type Product = { id: string; name: string; sku: string; stock: number; active: boolean };

function AdminEstoque() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [entry, setEntry] = useState<Record<string, string>>({});

  const { data: products } = useQuery({
    queryKey: ["admin-stock"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, sku, stock, active")
        .order("sort_order");
      return (data ?? []) as Product[];
    },
  });

  const { data: movements } = useQuery({
    queryKey: ["admin-stock-movements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inventory_movements")
        .select("id, delta, reason, created_at, product_id")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  async function apply(p: Product, delta: number, reason: string) {
    const next = p.stock + delta;
    if (next < 0) {
      toast.error("Estoque não pode ficar negativo.");
      return;
    }
    setBusy(p.id);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", p.id);
    if (error) {
      setBusy(null);
      toast.error("Não foi possível atualizar o estoque.");
      return;
    }
    await supabase.from("inventory_movements").insert({ product_id: p.id, delta, reason });
    setBusy(null);
    toast.success(`${p.name}: ${next} un. em estoque.`);
    setEntry((e) => ({ ...e, [p.id]: "" }));
    qc.invalidateQueries({ queryKey: ["admin-stock"] });
    qc.invalidateQueries({ queryKey: ["admin-stock-movements"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  }

  async function setAbsolute(p: Product) {
    const raw = entry[p.id];
    const value = parseInt((raw ?? "").trim(), 10);
    if (!Number.isInteger(value) || value < 0) {
      toast.error("Informe uma quantidade válida.");
      return;
    }
    await apply(p, value - p.stock, "ajuste manual");
  }

  const nameById = new Map((products ?? []).map((p) => [p.id, p.name]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-ink">Estoque</h1>
        <p className="mt-1 text-sm text-ash">
          Registre entradas de mercadoria, faça ajustes e acompanhe o histórico de movimentações.
        </p>
      </header>

      <div className="space-y-4">
        {(products ?? []).map((p) => {
          const low = p.stock <= 10;
          return (
            <div key={p.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-display text-xl text-ink">{p.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ash">{p.sku}</p>
                </div>
                <p className={`text-lg ${low ? "text-destructive" : "text-ink"}`}>
                  {p.stock} un. {low && <span className="text-[11px] uppercase tracking-[0.14em]">· estoque baixo</span>}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {[-10, -1, 1, 10, 50].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={busy === p.id}
                    onClick={() => apply(p, d, d > 0 ? "entrada rápida" : "baixa rápida")}
                    className="border border-input px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ash transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
                <span className="mx-1 h-5 w-px bg-border" />
                <input
                  inputMode="numeric"
                  value={entry[p.id] ?? ""}
                  onChange={(e) => setEntry((s) => ({ ...s, [p.id]: e.target.value }))}
                  placeholder="Qtd. total"
                  className="w-28 border border-input bg-ivory px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => setAbsolute(p)}
                  className="bg-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory disabled:opacity-40"
                >
                  Definir estoque
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="font-display text-2xl text-ink">Últimas movimentações</h2>
        {(movements ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-ash">Nenhuma movimentação registrada.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {(movements ?? []).map((m: any) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span className="text-ash">
                  {nameById.get(m.product_id) ?? "Produto"} · {m.reason}
                </span>
                <span className={m.delta > 0 ? "text-ink" : "text-destructive"}>
                  {m.delta > 0 ? `+${m.delta}` : m.delta} ·{" "}
                  {new Date(m.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
