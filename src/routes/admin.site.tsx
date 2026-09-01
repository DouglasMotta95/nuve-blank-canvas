import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/site")({
  head: () => ({ meta: [{ title: "Dados do site — Painel NUVE" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminSite,
});

type SiteIdentity = {
  announcement: string;
  instagram: string;
  tiktok: string;
  email: string;
};

const DEFAULTS: SiteIdentity = {
  announcement: "Leve 2 ou mais e ganhe 10% OFF automático",
  instagram: "https://www.instagram.com/nuve_serum?igsi=MWF0eGxhdmp0MXloMg==",
  tiktok: "https://www.tiktok.com/@nuveadvanced",
  email: "nuveadvanced@gmail.com",
};

function AdminSite() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-site-identity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "site_identity").maybeSingle();
      if (error) throw error;
      return { ...DEFAULTS, ...((data?.value as Partial<SiteIdentity> | null) ?? {}) };
    },
  });
  const [draft, setDraft] = useState<SiteIdentity | null>(null);
  const form = draft ?? data ?? DEFAULTS;
  const set = <K extends keyof SiteIdentity>(key: K, value: SiteIdentity[K]) => setDraft({ ...form, [key]: value });

  async function save() {
    const { error } = await supabase.from("site_settings").upsert({
      key: "site_identity",
      value: form,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    if (error) return toast.error("Não foi possível salvar os dados do site.");
    toast.success("Dados públicos atualizados.");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin-site-identity"] });
    qc.invalidateQueries({ queryKey: ["setting", "site_identity"] });
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Dados públicos do site</h1>
        <p className="mt-1 text-sm text-ash">Altere a faixa promocional e os canais de contato exibidos para as clientes.</p>
      </header>
      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Faixa promocional do topo</span><input value={form.announcement} onChange={(e) => set("announcement", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Instagram</span><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">TikTok</span><input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">E-mail público</span><input value={form.email} onChange={(e) => set("email", e.target.value)} className={input} /></label>
        <div className="sm:col-span-2"><button type="button" onClick={save} className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory">Salvar dados</button></div>
      </section>
    </div>
  );
}
