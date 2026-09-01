import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/admin/kits")({
  head: () => ({ meta: [{ title: "Kits — Painel NUVE" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminKits,
});

type ProductOption = { id: string; name: string; slug: string; active: boolean };
type KitRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  percent_off: number;
  product_slugs: unknown;
  sort_order: number;
  active: boolean;
};

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function normalizeSlugs(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function AdminKits() {
  const qc = useQueryClient();
  const upload = useServerFn(uploadMedia);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    slug: "",
    description: "",
    sort_order: "0",
    percent_off: "10",
    product_slugs: [] as string[],
    active: true,
    image: null as File | null,
  });

  const { data: products } = useQuery({
    queryKey: ["admin-kit-products"],
    queryFn: async (): Promise<ProductOption[]> => {
      const { data, error } = await supabase.from("products").select("id,name,slug,active").order("sort_order");
      if (error) throw error;
      return (data ?? []) as ProductOption[];
    },
  });

  const { data: kits, isLoading } = useQuery({
    queryKey: ["admin-kits"],
    queryFn: async (): Promise<KitRow[]> => {
      const { data, error } = await supabase.from("kits").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as KitRow[];
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-kits"] });
    qc.invalidateQueries({ queryKey: ["kits"] });
  }

  function toggleDraft(slug: string) {
    setDraft((current) => ({
      ...current,
      product_slugs: current.product_slugs.includes(slug)
        ? current.product_slugs.filter((item) => item !== slug)
        : [...current.product_slugs, slug],
    }));
  }

  async function createKit() {
    const name = draft.name.trim();
    const slug = draft.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    if (!name || !slug) return toast.error("Nome e link do kit são obrigatórios.");
    if (draft.product_slugs.length < 2) return toast.error("Escolha pelo menos 2 produtos para o kit.");
    const percentOff = Number(draft.percent_off);
    if (!Number.isFinite(percentOff) || percentOff < 0 || percentOff > 100) return toast.error("Desconto inválido.");

    setCreating(true);
    try {
      let image: string | null = null;
      if (draft.image) {
        const dataBase64 = await fileToBase64(draft.image);
        const uploaded = await upload({ data: { name: draft.image.name, type: draft.image.type, dataBase64 } });
        image = uploaded.url;
      }
      const payload = {
        name,
        slug,
        description: draft.description.trim() || null,
        image,
        percent_off: percentOff,
        product_slugs: draft.product_slugs,
        sort_order: Number.parseInt(draft.sort_order, 10) || 0,
        active: draft.active,
      };
      const { error } = await supabase.from("kits").insert(payload as never);
      if (error) throw error;
      toast.success("Kit criado.");
      setDraft({ name: "", slug: "", description: "", sort_order: "0", percent_off: "10", product_slugs: [], active: true, image: null });
      refresh();
    } catch {
      toast.error("Não foi possível criar o kit. Confira se o link é único.");
    } finally {
      setCreating(false);
    }
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-ink">Kits</h1>
        <p className="mt-1 text-sm text-ash">Crie e edite kits escolhendo os produtos cadastrados, sem alterar código.</p>
      </header>

      <section className="border border-border bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Adicionar kit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Nome</span><input value={draft.name} onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))} className={input} /></label>
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Link do kit</span><input value={draft.slug} onChange={(e) => setDraft((c) => ({ ...c, slug: e.target.value }))} placeholder="ex: ritual-completo" className={input} /></label>
          <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Descrição</span><textarea value={draft.description} onChange={(e) => setDraft((c) => ({ ...c, description: e.target.value }))} rows={3} className={input} /></label>
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Ordem</span><input value={draft.sort_order} onChange={(e) => setDraft((c) => ({ ...c, sort_order: e.target.value }))} className={input} /></label>
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Desconto do kit (%)</span><input value={draft.percent_off} onChange={(e) => setDraft((c) => ({ ...c, percent_off: e.target.value }))} className={input} /></label>
          <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Imagem</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setDraft((c) => ({ ...c, image: e.target.files?.[0] ?? null }))} className="mt-2 block w-full text-sm" /></label>
          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ash">Produtos do kit</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(products ?? []).map((product) => (
                <label key={product.id} className="flex items-center gap-2 border border-border p-3 text-sm text-ink">
                  <input type="checkbox" checked={draft.product_slugs.includes(product.slug)} onChange={() => toggleDraft(product.slug)} />
                  <span>{product.name}{product.active ? "" : " (inativo)"}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft((c) => ({ ...c, active: e.target.checked }))} /> Exibir no site</label>
        </div>
        <button type="button" disabled={creating} onClick={createKit} className="mt-5 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-60">{creating ? "Criando…" : "Adicionar kit"}</button>
      </section>

      {isLoading && <div className="h-40 animate-pulse bg-cream" />}
      <div className="space-y-4">
        {(kits ?? []).map((kit) => <KitEditor key={kit.id} kit={kit} products={products ?? []} onChanged={refresh} />)}
      </div>
    </div>
  );
}

function KitEditor({ kit, products, onChanged }: { kit: KitRow; products: ProductOption[]; onChanged: () => void }) {
  const upload = useServerFn(uploadMedia);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: kit.name,
    slug: kit.slug,
    description: kit.description ?? "",
    sort_order: String(kit.sort_order),
    percent_off: String(kit.percent_off),
    product_slugs: normalizeSlugs(kit.product_slugs),
    active: kit.active,
  });

  function toggleProduct(slug: string) {
    setForm((current) => ({
      ...current,
      product_slugs: current.product_slugs.includes(slug)
        ? current.product_slugs.filter((item) => item !== slug)
        : [...current.product_slugs, slug],
    }));
  }

  async function save() {
    if (!form.name.trim() || !form.slug.trim()) return toast.error("Nome e link do kit são obrigatórios.");
    if (form.product_slugs.length < 2) return toast.error("Escolha pelo menos 2 produtos.");
    const percentOff = Number(form.percent_off);
    if (!Number.isFinite(percentOff) || percentOff < 0 || percentOff > 100) return toast.error("Desconto inválido.");
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        description: form.description.trim() || null,
        percent_off: percentOff,
        product_slugs: form.product_slugs,
        sort_order: Number.parseInt(form.sort_order, 10) || 0,
        active: form.active,
      };
      const { error } = await supabase.from("kits").update(payload as never).eq("id", kit.id);
      if (error) throw error;
      toast.success("Kit atualizado.");
      onChanged();
    } catch {
      toast.error("Não foi possível salvar o kit.");
    } finally {
      setBusy(false);
    }
  }

  async function replaceImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const uploaded = await upload({ data: { name: file.name, type: file.type, dataBase64 } });
      const { error } = await supabase.from("kits").update({ image: uploaded.url } as never).eq("id", kit.id);
      if (error) throw error;
      toast.success("Imagem do kit atualizada.");
      onChanged();
    } catch {
      toast.error("Não foi possível trocar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Excluir este kit?")) return;
    const { error } = await supabase.from("kits").delete().eq("id", kit.id);
    if (error) return toast.error("Não foi possível excluir o kit.");
    toast.success("Kit excluído.");
    onChanged();
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <article className="border border-border bg-card p-5">
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div>
          {kit.image ? <img src={kit.image} alt={kit.name} className="h-44 w-full bg-cream object-contain" /> : <div className="grid h-44 place-items-center bg-cream text-xs text-ash">Sem imagem</div>}
          <label className="mt-3 block text-xs text-ash">Trocar imagem<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => replaceImage(e.target.files?.[0])} className="mt-2 block w-full text-xs" /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Nome</span><input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} className={input} /></label>
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Link</span><input value={form.slug} onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))} className={input} /></label>
          <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Descrição</span><textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} rows={3} className={input} /></label>
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Ordem</span><input value={form.sort_order} onChange={(e) => setForm((c) => ({ ...c, sort_order: e.target.value }))} className={input} /></label>
          <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Desconto (%)</span><input value={form.percent_off} onChange={(e) => setForm((c) => ({ ...c, percent_off: e.target.value }))} className={input} /></label>
          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ash">Produtos do kit</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-2 border border-border p-3 text-sm text-ink"><input type="checkbox" checked={form.product_slugs.includes(product.slug)} onChange={() => toggleProduct(product.slug)} /> {product.name}</label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-ink"><input type="checkbox" checked={form.active} onChange={(e) => setForm((c) => ({ ...c, active: e.target.checked }))} /> Exibir no site</label>
            <button type="button" disabled={busy} onClick={save} className="bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory disabled:opacity-60">Salvar</button>
            <button type="button" onClick={remove} className="text-[11px] uppercase tracking-[0.14em] text-ash underline">Excluir</button>
          </div>
        </div>
      </div>
    </article>
  );
}
