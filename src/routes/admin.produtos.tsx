import { createFileRoute } from "@tanstack/react-router";
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
      { property: "og:title", content: "Produtos — Painel NUVE" },
      { property: "og:description", content: "Gestão completa do catálogo." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminProdutos,
});

const SELECT =
  "*, product_images(id,url,alt,sort_order,is_cover,fit,is_before_after)";

function money(cents: number | null) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
function toCents(v: string) {
  const n = parseFloat((v ?? "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}
function lines(v: string) {
  return v.split("\n").map((l) => l.trim()).filter(Boolean);
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
      <header>
        <h1 className="font-display text-3xl text-ink">Produtos</h1>
        <p className="mt-1 text-sm text-ash">
          Altere preços, textos, benefícios, SEO e as fotos de cada produto. As mudanças aparecem no site na hora.
        </p>
      </header>

      {isLoading && <div className="h-40 animate-pulse bg-cream" />}

      <div className="space-y-4">
        {(data ?? []).map((p: any) => (
          <article key={p.id} className="border border-border bg-card">
            <div className="flex flex-wrap items-center gap-4 p-5">
              <img
                src={(p.product_images ?? []).find((i: any) => i.is_cover)?.url ?? p.product_images?.[0]?.url}
                alt={p.name}
                className="h-16 w-16 shrink-0 bg-cream object-contain"
              />
              <div className="min-w-[12rem] flex-1">
                <p className="font-display text-xl text-ink">{p.name}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-ash">
                  {p.sku} · {brl(p.sale_price_cents || p.price_cents)} · estoque {p.stock}
                  {p.active ? "" : " · inativo"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(open === p.id ? null : p.id)}
                className="bg-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory"
              >
                {open === p.id ? "Fechar" : "Editar tudo"}
              </button>
            </div>
            {open === p.id && <ProductEditor product={p} onSaved={refresh} />}
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-ash">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";

function ProductEditor({ product, onSaved }: { product: any; onSaved: () => void }) {
  const [form, setForm] = useState(() => ({
    name: product.name ?? "",
    sku: product.sku ?? "",
    slug: product.slug ?? "",
    tagline: product.tagline ?? "",
    short_description: product.short_description ?? "",
    description: product.description ?? "",
    price: money(product.price_cents),
    sale_price: money(product.sale_price_cents),
    stock: String(product.stock ?? 0),
    sort_order: String(product.sort_order ?? 0),
    best_for: product.best_for ?? "",
    routine: product.routine ?? "",
    benefits: (product.benefits ?? []).join("\n"),
    how_to_use: (product.how_to_use ?? []).join("\n"),
    actives: (product.actives ?? []).map((a: any) => `${a.name} | ${a.text}`).join("\n"),
    seo_title: product.seo_title ?? "",
    seo_description: product.seo_description ?? "",
    active: !!product.active,
    featured: !!product.featured,
  }));
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    const price = toCents(form.price);
    if (!price || price <= 0) { toast.error("Preço inválido."); return; }
    const stock = parseInt(form.stock, 10);
    if (!Number.isInteger(stock) || stock < 0) { toast.error("Estoque inválido."); return; }
    if (!form.name.trim() || !form.slug.trim() || !form.sku.trim())
      { toast.error("Nome, link (slug) e SKU são obrigatórios."); return; }

    setSaving(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name.trim().slice(0, 120),
        sku: form.sku.trim().slice(0, 40),
        slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60),
        tagline: form.tagline.slice(0, 160) || null,
        short_description: form.short_description.slice(0, 400) || null,
        description: form.description.slice(0, 4000) || null,
        price_cents: price,
        sale_price_cents: toCents(form.sale_price) ?? null,
        stock,
        sort_order: parseInt(form.sort_order, 10) || 0,
        best_for: form.best_for.slice(0, 200) || null,
        routine: form.routine.slice(0, 400) || null,
        benefits: lines(form.benefits).slice(0, 20) as never,
        how_to_use: lines(form.how_to_use).slice(0, 20) as never,
        actives: lines(form.actives).slice(0, 20).map((l) => {
          const [name, ...rest] = l.split("|");
          return { name: (name ?? "").trim(), text: rest.join("|").trim() };
        }) as never,
        seo_title: form.seo_title.slice(0, 70) || null,
        seo_description: form.seo_description.slice(0, 170) || null,
        active: form.active,
        featured: form.featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar. Confira o link (slug) e o SKU, que devem ser únicos.");
      return;
    }
    toast.success("Produto atualizado.");
    onSaved();
  }

  return (
    <div className="space-y-8 border-t border-border p-5">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} maxLength={120} />
        </Field>
        <Field label="Frase curta (tagline)">
          <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputCls} maxLength={160} />
        </Field>
        <Field label="Preço (R$)">
          <input value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Preço promocional (R$) — vazio = sem promoção">
          <input value={form.sale_price} onChange={(e) => set("sale_price", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Estoque">
          <input value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Ordem na loja">
          <input value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} className={inputCls} />
        </Field>
        <Field label="SKU">
          <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} maxLength={40} />
        </Field>
        <Field label="Link do produto (slug)">
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} maxLength={60} />
        </Field>
        <Field label="Resumo (aparece na loja)" wide>
          <textarea
            value={form.short_description}
            onChange={(e) => set("short_description", e.target.value)}
            rows={2}
            maxLength={400}
            className={inputCls}
          />
        </Field>
        <Field label="Descrição completa" wide>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={5}
            maxLength={4000}
            className={inputCls}
          />
        </Field>
        <Field label="Benefícios (um por linha)">
          <textarea value={form.benefits} onChange={(e) => set("benefits", e.target.value)} rows={5} className={inputCls} />
        </Field>
        <Field label="Como usar (um passo por linha)">
          <textarea value={form.how_to_use} onChange={(e) => set("how_to_use", e.target.value)} rows={5} className={inputCls} />
        </Field>
        <Field label="Ativos — formato: Nome | explicação (um por linha)" wide>
          <textarea value={form.actives} onChange={(e) => set("actives", e.target.value)} rows={4} className={inputCls} />
        </Field>
        <Field label="Indicado para">
          <input value={form.best_for} onChange={(e) => set("best_for", e.target.value)} className={inputCls} maxLength={200} />
        </Field>
        <Field label="Rotina sugerida">
          <input value={form.routine} onChange={(e) => set("routine", e.target.value)} className={inputCls} maxLength={400} />
        </Field>
        <Field label="Título SEO (máx. 60)">
          <input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={inputCls} maxLength={70} />
        </Field>
        <Field label="Descrição SEO (máx. 160)">
          <input
            value={form.seo_description}
            onChange={(e) => set("seo_description", e.target.value)}
            className={inputCls}
            maxLength={170}
          />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
          Visível na loja
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4" />
          Destaque na home
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>

      <ImageManager productId={product.id} images={product.product_images ?? []} onChanged={onSaved} />
    </div>
  );
}

function ImageManager({
  productId,
  images,
  onChanged,
}: {
  productId: string;
  images: any[];
  onChanged: () => void;
}) {
  const upload = useServerFn(uploadMedia);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  async function patch(id: string, p: Record<string, unknown>) {
    const { error } = await supabase.from("product_images").update(p as never).eq("id", id);
    if (error) { toast.error("Não foi possível atualizar a foto."); return; }
    onChanged();
  }

  async function setCover(id: string) {
    await supabase.from("product_images").update({ is_cover: false }).eq("product_id", productId);
    await patch(id, { is_cover: true });
    toast.success("Capa definida.");
  }

  async function remove(id: string) {
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) { toast.error("Não foi possível remover."); return; }
    toast.success("Foto removida.");
    onChanged();
  }

  async function addUrl(url: string, isBeforeAfter = false) {
    if (!/^(https?:\/\/|\/)/.test(url)) { toast.error("Informe um endereço de imagem válido."); return; }
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      url,
      sort_order: (sorted.at(-1)?.sort_order ?? 0) + 1,
      is_cover: sorted.length === 0,
      is_before_after: isBeforeAfter,
    });
    if (error) { toast.error("Não foi possível adicionar a foto."); return; }
    toast.success("Foto adicionada.");
    onChanged();
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const file of Array.from(files).slice(0, 8)) {
        const dataBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
          r.onerror = () => reject(new Error("read"));
          r.readAsDataURL(file);
        });
        const res = await upload({ data: { name: file.name, type: file.type, dataBase64 } });
        await addUrl(res.url);
      }
    } catch {
      toast.error("Falha no envio. Use JPG, PNG ou WebP de até 10MB.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="space-y-4 border-t border-border pt-6">
      <div>
        <h3 className="font-display text-2xl text-ink">Fotos do produto</h3>
        <p className="mt-1 text-sm text-ash">
          Envie do computador ou do celular. Marque a capa, ajuste a ordem e indique quais fotos são de “antes e depois”.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => onFiles(e.target.files)}
          className="text-sm"
        />
        {busy && <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Enviando…</span>}
      </div>

      <UrlAdder onAdd={addUrl} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((img) => (
          <div key={img.id} className="space-y-2 border border-border bg-ivory p-3">
            <img src={img.url} alt={img.alt ?? ""} className="h-40 w-full bg-cream object-contain" />
            <input
              defaultValue={img.alt ?? ""}
              placeholder="Descrição da foto (alt)"
              onBlur={(e) => patch(img.id, { alt: e.target.value })}
              className="w-full border border-input bg-card px-2 py-1.5 text-xs"
            />
            <div className="flex items-center gap-2">
              <input
                defaultValue={img.sort_order}
                onBlur={(e) => patch(img.id, { sort_order: Number(e.target.value) || 0 })}
                className="w-16 border border-input bg-card px-2 py-1.5 text-xs"
                aria-label="Ordem"
              />
              <button
                type="button"
                onClick={() => setCover(img.id)}
                className={`px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] ${
                  img.is_cover ? "bg-ink text-ivory" : "border border-input text-ash"
                }`}
              >
                Capa
              </button>
              <button
                type="button"
                onClick={() => patch(img.id, { is_before_after: !img.is_before_after })}
                className={`px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] ${
                  img.is_before_after ? "bg-clay text-ivory" : "border border-input text-ash"
                }`}
              >
                Antes/Depois
              </button>
              <button
                type="button"
                onClick={() => remove(img.id)}
                className="ml-auto text-[10px] uppercase tracking-[0.14em] text-ash underline"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UrlAdder({ onAdd }: { onAdd: (url: string, isBeforeAfter?: boolean) => void }) {
  const [url, setUrl] = useState("");
  const [ba, setBa] = useState(false);
  useEffect(() => setUrl(""), []);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Ou cole o endereço (URL) de uma imagem"
        className="min-w-[16rem] flex-1 border border-input bg-ivory px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-xs text-ash">
        <input type="checkbox" checked={ba} onChange={(e) => setBa(e.target.checked)} className="h-4 w-4" />
        antes e depois
      </label>
      <button
        type="button"
        onClick={() => {
          onAdd(url.trim(), ba);
          setUrl("");
        }}
        className="border border-input px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-ash"
      >
        Adicionar
      </button>
    </div>
  );
}
