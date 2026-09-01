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

type WhatsAppSetting = {
  enabled: boolean;
  phone: string;
  message: string;
};

const DEFAULTS: SiteIdentity = {
  announcement: "Leve 2 ou mais e ganhe 10% OFF automático",
  instagram: "https://www.instagram.com/nuve_serum?igsi=MWF0eGxhdmp0MXloMg==",
  tiktok: "https://www.tiktok.com/@nuveadvanced",
  email: "nuveadvanced@gmail.com",
};

const WHATSAPP_DEFAULTS: WhatsAppSetting = {
  enabled: true,
  phone: "19991227755",
  message: "Olá! Gostaria de saber mais sobre os séruns NUVE Advance Skincare.",
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
  const { data: whatsappData } = useQuery({
    queryKey: ["admin-whatsapp"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle();
      if (error) throw error;
      return { ...WHATSAPP_DEFAULTS, ...((data?.value as Partial<WhatsAppSetting> | null) ?? {}) };
    },
  });

  const [draft, setDraft] = useState<SiteIdentity | null>(null);
  const [whatsappDraft, setWhatsappDraft] = useState<WhatsAppSetting | null>(null);
  const form = draft ?? data ?? DEFAULTS;
  const whatsapp = whatsappDraft ?? whatsappData ?? WHATSAPP_DEFAULTS;
  const set = <K extends keyof SiteIdentity>(key: K, value: SiteIdentity[K]) => setDraft({ ...form, [key]: value });
  const setWhatsapp = <K extends keyof WhatsAppSetting>(key: K, value: WhatsAppSetting[K]) =>
    setWhatsappDraft({ ...whatsapp, [key]: value });

  async function save() {
    const now = new Date().toISOString();
    const [siteResult, whatsappResult] = await Promise.all([
      supabase.from("site_settings").upsert(
        { key: "site_identity", value: form as never, updated_at: now },
        { onConflict: "key" },
      ),
      supabase.from("site_settings").upsert(
        { key: "whatsapp", value: whatsapp as never, updated_at: now },
        { onConflict: "key" },
      ),
    ]);

    if (siteResult.error || whatsappResult.error) {
      toast.error("Não foi possível salvar todos os dados do site.");
      return;
    }

    toast.success("Informações do site atualizadas.");
    setDraft(null);
    setWhatsappDraft(null);
    qc.invalidateQueries({ queryKey: ["admin-site-identity"] });
    qc.invalidateQueries({ queryKey: ["admin-whatsapp"] });
    qc.invalidateQueries({ queryKey: ["setting", "site_identity"] });
    qc.invalidateQueries({ queryKey: ["setting", "whatsapp"] });
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Informações do site</h1>
        <p className="mt-1 text-sm text-ash">Centralize aqui os contatos, redes sociais, WhatsApp e a faixa promocional exibidos no site.</p>
      </header>

      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <h2 className="font-display text-2xl text-ink sm:col-span-2">Informações públicas</h2>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Faixa promocional do topo</span><input value={form.announcement} onChange={(e) => set("announcement", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Instagram</span><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">TikTok</span><input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">E-mail público</span><input value={form.email} onChange={(e) => set("email", e.target.value)} className={input} /></label>
      </section>

      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="font-display text-2xl text-ink">WhatsApp</h2>
          <p className="mt-1 text-sm text-ash">O número e a mensagem abaixo controlam o botão flutuante do site.</p>
        </div>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Número com DDD</span><input value={whatsapp.phone} onChange={(e) => setWhatsapp("phone", e.target.value)} placeholder="19999999999" className={input} /></label>
        <label className="flex items-end gap-2 pb-2 text-sm text-ink"><input type="checkbox" checked={whatsapp.enabled} onChange={(e) => setWhatsapp("enabled", e.target.checked)} /> Exibir botão do WhatsApp</label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Mensagem inicial</span><textarea value={whatsapp.message} onChange={(e) => setWhatsapp("message", e.target.value)} rows={3} className={input} /></label>
      </section>

      <button type="button" onClick={save} className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory">Salvar informações</button>
    </div>
  );
}
