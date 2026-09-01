import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/admin/produtos/novo")({
  head: () => ({ meta: [{ title: "Novo produto — Painel NUVE" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: NovoProduto,
});

function toCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? Math.round(number * 100) : null;
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function NovoProduto() {
  const navigate = useNavigate();
  const upload = useServerFn(uploadMedia);
  const [saving, setSaving] = useState(false);
  const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    tagline: "",
    short_description: "",
    description: "",
    price: "149,90",
    sale_price: "",
    stock: "0",
    sort_order: "0",
    active: true,
    featured: true,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function create() {
    const name = form.name.trim();
    const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    const sku = form.sku.trim();
    const price = toCents(form.price);
    const stock = Number.parseInt(form.stock, 10);
    if (!name || !slug || !sku) return toast.error("Nome, link do produto e SKU são obrigatórios.");
    if (!price || price <= 0) return toast.error("Informe um preço válido.");
    if (!Number.isInteger(stock) || stock < 0) return toast.error("Informe um estoque válido.");

    setSaving(true);
    try {
      const { data: product, error } = await supabase
        .from("products")
        .insert({
          name,
          slug,
          sku,
          tagline: form.tagline.trim() || null,
          short_description: form.short_description.trim() || null,
          description: form.description.trim() || null,
          price_cents: price,
          sale_price_cents: toCents(form.sale_price),
          stock,
          sort_order: Number.parseInt(form.sort_order, 10) || 0,
          active: form.active,
          featured: form.featured,
          benefits: [],
          actives: [],
          how_to_use: [],
        })
        .select("id")
        .single();
      if (error || !product) throw error ?? new Error("product");

      if (cover) {
        const dataBase64 = await fileToBase64(cover);
        const uploaded = await upload({ data: { name: cover.name, type: cover.type, dataBase64 } });
        const { error: imageError } = await supabase.from("product_images").insert({
          product_id: product.id,
          url: uploaded.url,
          alt: name,
          sort_order: 0,
          is_cover: true,
          fit: "contain",
          active: true,
        });
        if (imageError) throw imageError;
      }

      toast.success("Produto criado. Agora você pode completar a galeria e os detalhes.");
      await navigate({ to: "/admin/produtos" });
    } catch {
      toast.error("Não foi possível criar. Confira se SKU e link do produto são únicos.");
    } finally {
      setSaving(false);
    }
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Adicionar produto</h1>
        <p className="mt-1 text-sm text-ash">Cadastre um novo produto sem alterar código. Depois de salvar, ele poderá ser editado normalmente no catálogo.</p>
      </header>
      <section className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-2">
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Nome</span><input value={form.name} onChange={(e) => set("name", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">SKU</span><input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Link do produto</span><input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="ex: nuve-novo-serum" className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Frase curta</span><input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Preço (R$)</span><input value={form.price} onChange={(e) => set("price", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Preço promocional (R$)</span><input value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Estoque</span><input value={form.stock} onChange={(e) => set("stock", e.target.value)} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Ordem na loja</span><input value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Resumo</span><textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)} rows={2} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Descrição</span><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className={input} /></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Foto de capa inicial</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCover(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" /></label>
        <div className="flex flex-wrap gap-5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Visível na loja</label>
          <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Destaque na home</label>
        </div>
        <div className="sm:col-span-2"><button type="button" disabled={saving} onClick={create} className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-60">{saving ? "Criando…" : "Criar produto"}</button></div>
      </section>
    </div>
  );
}
