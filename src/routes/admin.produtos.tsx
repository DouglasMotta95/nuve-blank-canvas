import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { uploadMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Painel NUVE" },
      { name: "description", content: "Edite preços, textos, fotos e estoque dos produtos NUVE." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminProdutos,
});

const SELECT = "*, product_images(id,url,alt,sort_order,is_cover,fit,is_before_after,active)";

function money(cents: number | null) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
function toCents(value: string) {
  const number = Number.parseFloat((value ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(number) ? Math.round(number * 100) : null;
}
function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}
async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function AdminProdutos() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select(SELECT).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
  const [open, setOpen] = useState<string | null>(null);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["product"] });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Produtos</h1>
          <p className="mt-1 text-sm text-ash">Cadastre produtos e altere preços, textos, estoque, capa e galeria.</p>
        </div>
        <Link to="/admin/produtos/novo" className="bg-ink px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-ivory">Adicionar produto</Link>
      </header>

      {isLoading && <div className="h-40 animate-pulse bg-cream" />}

      <div className="space-y-4">
        {(data ?? []).map((product: any) => {
          const cover = (product.product_images ?? []).find((image: any) => image.is_cover && image.active !== false) ?? (product.product_images ?? []).find((image: any) => image.active !== false);
          return (
            <article key={product.id} className="border border-border bg-card">
              <div className="flex flex-wrap items-center gap-4 p-5">
                {cover?.url ? <img src={cover.url} alt={product.name} className="h-16 w-16 shrink-0 bg-cream object-contain" /> : <div className="grid h-16 w-16 shrink-0 place-items-center bg-cream text-[9px] uppercase text-ash">Sem foto</div>}
                <div className="min-w-[12rem] flex-1">
                  <p className="font-display text-xl text-ink">{product.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ash">{product.sku} · {brl(product.sale_price_cents || product.price_cents)} · estoque {product.stock}{product.active ? "" : " · inativo"}</p>
                </div>
                <button type="button" onClick={() => setOpen(open === product.id ? null : product.id)} className="bg-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory">{open === product.id ? "Fechar" : "Editar tudo"}</button>
              </div>
              {open === product.id && <ProductEditor product={product} onSaved={refresh} />}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={`block ${wide ? "sm:col-span-2" : ""}`}><span className="text-[11px] uppercase tracking-[0.14em] text-ash">{label}</span>{children}</label>;
}

const inputCls = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";

function ProductEditor({ product, onSaved }: { product: any; onSaved: () => void }) {
  const [form, setForm] = useState(() => ({
    name: product.name ?? "", sku: product.sku ?? "", slug: product.slug ?? "", tagline: product.tagline ?? "",
    short_description: product.short_description ?? "", description: product.description ?? "", price: money(product.price_cents),
    sale_price: money(product.sale_price_cents), stock: String(product.stock ?? 0), sort_order: String(product.sort_order ?? 0),
    best_for: product.best_for ?? "", routine: product.routine ?? "", benefits: (product.benefits ?? []).join("\n"),
    how_to_use: (product.how_to_use ?? []).join("\n"), actives: (product.actives ?? []).map((active: any) => `${active.name} | ${active.text}`).join("\n"),
    seo_title: product.seo_title ?? "", seo_description: product.seo_description ?? "", active: !!product.active, featured: !!product.featured,
  }));
  const [saving, setSaving] = useState(false);
  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function save() {
    const price = toCents(form.price);
    const stock = Number.parseInt(form.stock, 10);
    if (!price || price <= 0) return toast.error("Preço inválido.");
    if (!Number.isInteger(stock) || stock < 0) return toast.error("Estoque inválido.");
    if (!form.name.trim() || !form.slug.trim() || !form.sku.trim()) return toast.error("Nome, link e SKU são obrigatórios.");
    setSaving(true);
    const { error } = await supabase.from("products").update({
      name: form.name.trim().slice(0, 120), sku: form.sku.trim().slice(0, 40),
      slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60), tagline: form.tagline.slice(0, 160) || null,
      short_description: form.short_description.slice(0, 400) || null, description: form.description.slice(0, 4000) || null,
      price_cents: price, sale_price_cents: toCents(form.sale_price) ?? null, stock, sort_order: Number.parseInt(form.sort_order, 10) || 0,
      best_for: form.best_for.slice(0, 200) || null, routine: form.routine.slice(0, 400) || null,
      benefits: lines(form.benefits).slice(0, 20) as never, how_to_use: lines(form.how_to_use).slice(0, 20) as never,
      actives: lines(form.actives).slice(0, 20).map((line) => { const [name, ...rest] = line.split("|"); return { name: (name ?? "").trim(), text: rest.join("|").trim() }; }) as never,
      seo_title: form.seo_title.slice(0, 70) || null, seo_description: form.seo_description.slice(0, 170) || null,
      active: form.active, featured: form.featured, updated_at: new Date().toISOString(),
    }).eq("id", product.id);
    setSaving(false);
    if (error) return toast.error("Não foi possível salvar. Confira o link e o SKU.");
    toast.success("Produto atualizado.");
    onSaved();
  }

  return (
    <div className="space-y-8 border-t border-border p-5">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></Field>
        <Field label="Frase curta"><input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} /></Field>
        <Field label="Preço (R$)"><input value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} /></Field>
        <Field label="Preço promocional (R$)"><input value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} className={inputCls} /></Field>
        <Field label="Estoque"><input value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} /></Field>
        <Field label="Ordem na loja"><input value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={inputCls} /></Field>
        <Field label="SKU"><input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} /></Field>
        <Field label="Link do produto"><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} /></Field>
        <Field label="Resumo" wide><textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)} rows={2} className={inputCls} /></Field>
        <Field label="Descrição completa" wide><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} className={inputCls} /></Field>
        <Field label="Benefícios — um por linha"><textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)} rows={5} className={inputCls} /></Field>
        <Field label="Como usar — um passo por linha"><textarea value={form.how_to_use} onChange={(e) => set("how_to_use", e.target.value)} rows={5} className={inputCls} /></Field>
        <Field label="Ativos — Nome | explicação" wide><textarea value={form.actives} onChange={(e) => set("actives", e.target.value)} rows={4} className={inputCls} /></Field>
        <Field label="Indicado para"><input value={form.best_for} onChange={(e) => set("best_for", e.target.value)} className={inputCls} /></Field>
        <Field label="Rotina sugerida"><input value={form.routine} onChange={(e) => set("routine", e.target.value)} className={inputCls} /></Field>
        <Field label="Título SEO"><input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={inputCls} /></Field>
        <Field label="Descrição SEO"><input value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} className={inputCls} /></Field>
      </section>
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /> Visível na loja</label>
        <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Destaque na home</label>
        <button type="button" disabled={saving} onClick={save} className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-60">{saving ? "Salvando…" : "Salvar alterações"}</button>
      </div>
      <ImageManager productId={product.id} images={product.product_images ?? []} onChanged={onSaved} />
    </div>
  );
}

function ImageManager({ productId, images, onChanged }: { productId: string; images: any[]; onChanged: () => void }) {
  const upload = useServerFn(uploadMedia);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  async function patch(id: string, values: Record<string, unknown>) {
    const { error } = await supabase.from("product_images").update(values as never).eq("id", id);
    if (error) return toast.error("Não foi possível atualizar a foto.");
    onChanged();
  }
  async function setCover(id: string) {
    const { error } = await supabase.from("product_images").update({ is_cover: false }).eq("product_id", productId);
    if (error) return toast.error("Não foi possível alterar a capa.");
    await patch(id, { is_cover: true, active: true });
    toast.success("Capa definida.");
  }
  async function remove(id: string) {
    if (!window.confirm("Remover esta foto?")) return;
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) return toast.error("Não foi possível remover.");
    toast.success("Foto removida."); onChanged();
  }
  async function addUrl(url: string, isBeforeAfter = false) {
    if (!/^(https?:\/\/|\/)/.test(url)) return toast.error("Informe um endereço de imagem válido.");
    const { error } = await supabase.from("product_images").insert({ product_id: productId, url, sort_order: (sorted.at(-1)?.sort_order ?? -1) + 1, is_cover: sorted.length === 0, is_before_after: isBeforeAfter, active: true } as never);
    if (error) return toast.error("Não foi possível adicionar a foto.");
    toast.success("Foto adicionada."); onChanged();
  }
  async function uploadFile(file: File) {
    const dataBase64 = await fileToBase64(file);
    return upload({ data: { name: file.name, type: file.type, dataBase64 } });
  }
  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files).slice(0, 8)) {
        const result = await uploadFile(file);
        await addUrl(result.url);
      }
    } catch { toast.error("Falha no envio. Use JPG, PNG ou WebP de até 10MB."); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  async function replaceImage(id: string, file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try { const result = await uploadFile(file); await patch(id, { url: result.url }); toast.success("Foto substituída."); }
    catch { toast.error("Não foi possível substituir a foto."); }
    finally { setBusy(false); }
  }

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <div><h3 className="font-display text-2xl text-ink">Fotos do produto</h3><p className="mt-1 text-sm text-ash">Adicione, substitua, ative, ordene e escolha a capa.</p></div>
      <div className="flex flex-wrap items-center gap-3">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => onFiles(e.target.files)} className="text-sm" />
        {busy && <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Enviando…</span>}
      </div>
      <UrlAdder onAdd={addUrl} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((image) => (
          <div key={image.id} className="space-y-2 border border-border bg-ivory p-3">
            <img src={image.url} alt={image.alt ?? ""} className="h-40 w-full bg-cream object-contain" />
            <input defaultValue={image.alt ?? ""} placeholder="Descrição da foto (alt)" onBlur={(e) => patch(image.id, { alt: e.target.value })} className="w-full border border-input bg-card px-2 py-1.5 text-xs" />
            <label className="block text-[10px] uppercase tracking-[0.12em] text-ash">Substituir foto<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => replaceImage(image.id, e.target.files?.[0])} className="mt-1 block w-full text-xs normal-case tracking-normal" /></label>
            <div className="flex flex-wrap items-center gap-2">
              <input defaultValue={image.sort_order} onBlur={(e) => patch(image.id, { sort_order: Number(e.target.value) || 0 })} className="w-16 border border-input bg-card px-2 py-1.5 text-xs" aria-label="Ordem" />
              <button type="button" onClick={() => setCover(image.id)} className={`px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] ${image.is_cover ? "bg-ink text-ivory" : "border border-input text-ash"}`}>Capa</button>
              <button type="button" onClick={() => patch(image.id, { active: image.active === false })} className={`px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] ${image.active === false ? "border border-input text-ash" : "bg-cream text-ink"}`}>{image.active === false ? "Oculta" : "Visível"}</button>
              <button type="button" onClick={() => patch(image.id, { is_before_after: !image.is_before_after })} className={`px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] ${image.is_before_after ? "bg-clay text-ivory" : "border border-input text-ash"}`}>Antes/Depois</button>
              <button type="button" onClick={() => remove(image.id)} className="ml-auto text-[10px] uppercase tracking-[0.14em] text-ash underline">Remover</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UrlAdder({ onAdd }: { onAdd: (url: string, isBeforeAfter?: boolean) => void }) {
  const [url, setUrl] = useState("");
  const [beforeAfter, setBeforeAfter] = useState(false);
  useEffect(() => setUrl(""), []);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ou cole o endereço (URL) de uma imagem" className="min-w-[16rem] flex-1 border border-input bg-ivory px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-xs text-ash"><input type="checkbox" checked={beforeAfter} onChange={(e) => setBeforeAfter(e.target.checked)} /> antes e depois</label>
      <button type="button" onClick={() => { onAdd(url.trim(), beforeAfter); setUrl(""); }} className="border border-input px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-ash">Adicionar</button>
    </div>
  );
}
