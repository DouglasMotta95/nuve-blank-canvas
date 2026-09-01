import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/cupons")({
  head: () => ({
    meta: [
      { title: "Cupons — Painel NUVE" },
      { name: "description", content: "Crie e gerencie cupons de desconto da loja NUVE." },
      { property: "og:title", content: "Cupons — Painel NUVE" },
      { property: "og:description", content: "Gestão de cupons de desconto." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminCupons,
});

function AdminCupons() {
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const { data } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function create() {
    const p = parseFloat(percent.replace(",", "."));
    if (!code.trim() || !Number.isFinite(p) || p <= 0 || p > 90) {
      toast.error("Informe um código e um percentual entre 1 e 90.");
      return;
    }
    const { error } = await supabase
      .from("coupons")
      .insert({ code: code.trim().toUpperCase(), percent_off: p, active: true });
    if (error) {
      toast.error("Não foi possível criar o cupom.");
      return;
    }
    setCode("");
    toast.success("Cupom criado.");
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  async function toggle(c: any) {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) {
      toast.error("Não foi possível atualizar.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-ink">Cupons</h1>

      <div className="flex flex-wrap items-end gap-3 border border-border bg-card p-5">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Código</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 block border border-input bg-ivory px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">% de desconto</span>
          <input value={percent} onChange={(e) => setPercent(e.target.value)} className="mt-1 block w-28 border border-input bg-ivory px-3 py-2 text-sm" />
        </label>
        <button type="button" onClick={create} className="bg-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory">
          Criar cupom
        </button>
      </div>

      <ul className="divide-y divide-border border-y border-border">
        {(data ?? []).map((c: any) => (
          <li key={c.id} className="flex items-center justify-between py-4 text-sm">
            <div>
              <p className="text-ink">{c.code}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-ash">
                {c.percent_off ? `${c.percent_off}%` : `R$ ${(c.amount_off_cents / 100).toFixed(2)}`} · usos {c.uses}
              </p>
            </div>
            <button type="button" onClick={() => toggle(c)} className="border border-input px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-ash">
              {c.active ? "Ativo" : "Inativo"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
