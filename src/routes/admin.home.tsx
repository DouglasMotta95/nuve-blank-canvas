import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/home")({
  head: () => ({ meta: [{ title: "Página inicial — Painel NUVE" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminHome,
});

type Pillar = { title: string; text: string };
type HomeContent = {
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_primary_label: string;
  hero_secondary_label: string;
  products_eyebrow: string;
  products_title: string;
  products_subtitle: string;
  line_details_eyebrow: string;
  line_details_title: string;
  reviews_eyebrow: string;
  reviews_title: string;
  show_pillars: boolean;
  show_products: boolean;
  show_japan: boolean;
  show_line_details: boolean;
  show_editorial: boolean;
  show_reviews: boolean;
  pillars: Pillar[];
};

const DEFAULTS: HomeContent = {
  hero_eyebrow: "NUVE Advance Skincare",
  hero_title: "Tecnologia japonesa. Ativos selecionados. Skincare para a vida real.",
  hero_subtitle: "A Nuve une a sofisticação do skincare japonês a fórmulas cuidadosamente desenvolvidas com ativos selecionados para transformar o cuidado com a pele em uma experiência simples, prática e especial.",
  hero_primary_label: "Conheça os produtos",
  hero_secondary_label: "Conheça a NUVE",
  products_eyebrow: "A linha",
  products_title: "Séruns para diferentes formas de cuidar.",
  products_subtitle: "Escolha a fórmula que mais combina com sua rotina ou combine dois produtos e receba 10% OFF automático quando elegível.",
  line_details_eyebrow: "Universo NUVE",
  line_details_title: "A linha em detalhes",
  reviews_eyebrow: "Experiências NUVE",
  reviews_title: "O que nossas clientes contam",
  show_pillars: true,
  show_products: true,
  show_japan: true,
  show_line_details: true,
  show_editorial: true,
  show_reviews: true,
  pillars: [
    { title: "Formulações desenvolvidas no Japão", text: "Tecnologia e conhecimento em skincare traduzidos para uma rotina moderna de cuidados com a pele." },
    { title: "Ativos selecionados", text: "Fórmulas pensadas para unir cuidado, praticidade e uma experiência sofisticada no dia a dia." },
    { title: "Menos complicação", text: "Uma proposta de skincare mais simples, sem perder intenção, tecnologia e sofisticação." },
    { title: "Beleza para a vida real", text: "Autocuidado que acompanha a rotina, com produtos que fazem sentido no uso diário." },
  ],
};

function AdminHome() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-home-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", "home_content").maybeSingle();
      if (error) throw error;
      const value = (data?.value as Partial<HomeContent> | null) ?? {};
      return { ...DEFAULTS, ...value, pillars: Array.isArray(value.pillars) ? value.pillars : DEFAULTS.pillars } as HomeContent;
    },
  });
  const [draft, setDraft] = useState<HomeContent | null>(null);
  const form = draft ?? data ?? DEFAULTS;
  const set = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) => setDraft({ ...form, [key]: value });

  function setPillar(index: number, key: keyof Pillar, value: string) {
    const pillars = form.pillars.map((pillar, i) => i === index ? { ...pillar, [key]: value } : pillar);
    set("pillars", pillars);
  }

  async function save() {
    const { error } = await supabase.from("site_settings").upsert({ key: "home_content", value: form, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return toast.error("Não foi possível salvar a página inicial.");
    toast.success("Página inicial atualizada.");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin-home-content"] });
    qc.invalidateQueries({ queryKey: ["setting", "home_content"] });
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <header><h1 className="font-display text-3xl text-ink">Página inicial</h1><p className="mt-1 text-sm text-ash">Edite os principais textos e escolha quais seções aparecem no site.</p></header>
      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <h2 className="font-display text-2xl text-ink sm:col-span-2">Topo do site</h2>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto pequeno</span><input value={form.hero_eyebrow} onChange={(e) => set("hero_eyebrow", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título padrão</span><input value={form.hero_title} onChange={(e) => set("hero_title", e.target.value)} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto principal padrão</span><textarea value={form.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} rows={3} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Botão produtos</span><input value={form.hero_primary_label} onChange={(e) => set("hero_primary_label", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Botão marca</span><input value={form.hero_secondary_label} onChange={(e) => set("hero_secondary_label", e.target.value)} className={input} /></label>
      </section>

      <section className="space-y-4 border border-border bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Pilares da marca</h2>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.show_pillars} onChange={(e) => set("show_pillars", e.target.checked)} /> Exibir esta seção</label>
        <div className="grid gap-4 md:grid-cols-2">
          {form.pillars.map((pillar, index) => (
            <div key={index} className="border border-border p-3">
              <input value={pillar.title} onChange={(e) => setPillar(index, "title", e.target.value)} className={input} placeholder="Título" />
              <textarea value={pillar.text} onChange={(e) => setPillar(index, "text", e.target.value)} rows={3} className={input} placeholder="Texto" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <h2 className="font-display text-2xl text-ink sm:col-span-2">Produtos</h2>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.show_products} onChange={(e) => set("show_products", e.target.checked)} /> Exibir produtos na Home</label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto pequeno</span><input value={form.products_eyebrow} onChange={(e) => set("products_eyebrow", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título</span><input value={form.products_title} onChange={(e) => set("products_title", e.target.value)} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto</span><textarea value={form.products_subtitle} onChange={(e) => set("products_subtitle", e.target.value)} rows={2} className={input} /></label>
      </section>

      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <h2 className="font-display text-2xl text-ink sm:col-span-2">Outras seções</h2>
        {([
          ["show_japan", "Exibir seção Japão"], ["show_line_details", "Exibir A linha em detalhes"], ["show_editorial", "Exibir banners editoriais"], ["show_reviews", "Exibir avaliações"],
        ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form[key]} onChange={(e) => set(key, e.target.checked)} /> {label}</label>)}
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto pequeno — galeria</span><input value={form.line_details_eyebrow} onChange={(e) => set("line_details_eyebrow", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título — galeria</span><input value={form.line_details_title} onChange={(e) => set("line_details_title", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto pequeno — avaliações</span><input value={form.reviews_eyebrow} onChange={(e) => set("reviews_eyebrow", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título — avaliações</span><input value={form.reviews_title} onChange={(e) => set("reviews_title", e.target.value)} className={input} /></label>
      </section>
      <button type="button" onClick={save} className="bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory">Salvar página inicial</button>
    </div>
  );
}
