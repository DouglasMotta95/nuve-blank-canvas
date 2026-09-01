import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [
      { title: "Conteúdo do site — Painel NUVE" },
      { name: "description", content: "Gerencie banners, imagens e textos da página inicial NUVE." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminBanners,
});

type BannerRow = {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
  image_desktop: string;
  image_mobile: string | null;
  image_fit: string;
  sort_order: number;
  active: boolean;
  placement: string;
  alt_text: string | null;
};

const PLACEMENTS = [
  ["hero", "Banner principal / Slider"],
  ["japan", "Seção Japão"],
  ["science", "Ciência e tecnologia"],
  ["editorial", "Banner editorial"],
  ["promotional", "Banner promocional"],
  ["fixed", "Banner fixo"],
  ["line_details", "A linha em detalhes"],
] as const;

function placementLabel(value: string) {
  return PLACEMENTS.find(([key]) => key === value)?.[1] ?? value;
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function AdminBanners() {
  const qc = useQueryClient();
  const upload = useServerFn(uploadMedia);
  const [creating, setCreating] = useState(false);
  const [newPlacement, setNewPlacement] = useState("hero");
  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async (): Promise<BannerRow[]> => {
      const { data, error } = await supabase.from("banners").select("*").order("placement").order("sort_order");
      if (error) throw error;
      return (data ?? []) as BannerRow[];
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
    qc.invalidateQueries({ queryKey: ["banners"] });
  }

  async function uploadFile(file: File) {
    const dataBase64 = await fileToBase64(file);
    return upload({ data: { name: file.name, type: file.type, dataBase64 } });
  }

  async function createBanner() {
    if (!newFile) {
      toast.error("Escolha uma imagem para criar o conteúdo.");
      return;
    }
    setCreating(true);
    try {
      const uploaded = await uploadFile(newFile);
      const siblings = (data ?? []).filter((item) => item.placement === newPlacement);
      const { error } = await supabase.from("banners").insert({
        placement: newPlacement,
        title: newTitle.trim() || null,
        image_desktop: uploaded.url,
        image_fit: "contain",
        sort_order: (siblings.at(-1)?.sort_order ?? -1) + 1,
        active: true,
      });
      if (error) throw error;
      toast.success("Conteúdo adicionado ao site.");
      setNewFile(null);
      setNewTitle("");
      refresh();
    } catch {
      toast.error("Não foi possível adicionar. Use JPG, PNG ou WebP de até 10MB.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-ink">Conteúdo visual do site</h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ash">
          Cada imagem tem um local definido. Alterar o Slider não troca mais a seção Japão ou os banners fixos.
        </p>
      </header>

      <section className="border border-border bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Adicionar imagem ou banner</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Onde aparece</span>
            <select value={newPlacement} onChange={(e) => setNewPlacement(e.target.value)} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm">
              {PLACEMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título opcional</span>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
          </label>
          <label className="md:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Imagem para computador</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />
          </label>
        </div>
        <button type="button" onClick={createBanner} disabled={creating} className="mt-5 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-60">
          {creating ? "Enviando…" : "Adicionar ao site"}
        </button>
      </section>

      {isLoading && <div className="h-40 animate-pulse bg-cream" />}

      <div className="space-y-5">
        {(data ?? []).map((banner) => (
          <BannerEditor key={banner.id} banner={banner} onChanged={refresh} uploadFile={uploadFile} />
        ))}
      </div>
    </div>
  );
}

function BannerEditor({
  banner,
  onChanged,
  uploadFile,
}: {
  banner: BannerRow;
  onChanged: () => void;
  uploadFile: (file: File) => Promise<{ url: string }>;
}) {
  const desktopRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => ({
    placement: banner.placement,
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    cta_label: banner.cta_label ?? "",
    cta_link: banner.cta_link ?? "",
    alt_text: banner.alt_text ?? "",
    sort_order: String(banner.sort_order),
    active: banner.active,
  }));

  async function save() {
    const { error } = await supabase.from("banners").update({
      placement: form.placement,
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      cta_label: form.cta_label.trim() || null,
      cta_link: form.cta_link.trim() || null,
      alt_text: form.alt_text.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      active: form.active,
    }).eq("id", banner.id);
    if (error) {
      toast.error("Não foi possível salvar este conteúdo.");
      return;
    }
    toast.success("Alterações salvas.");
    onChanged();
  }

  async function replaceImage(kind: "desktop" | "mobile", file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadFile(file);
      const patch = kind === "desktop" ? { image_desktop: uploaded.url } : { image_mobile: uploaded.url };
      const { error } = await supabase.from("banners").update(patch).eq("id", banner.id);
      if (error) throw error;
      toast.success(kind === "desktop" ? "Imagem para computador trocada." : "Imagem para celular trocada.");
      onChanged();
    } catch {
      toast.error("Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
      if (desktopRef.current) desktopRef.current.value = "";
      if (mobileRef.current) mobileRef.current.value = "";
    }
  }

  async function removeMobile() {
    const { error } = await supabase.from("banners").update({ image_mobile: null }).eq("id", banner.id);
    if (error) return toast.error("Não foi possível remover a imagem mobile.");
    toast.success("Imagem mobile removida.");
    onChanged();
  }

  async function removeBanner() {
    if (!window.confirm("Remover este conteúdo do site?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", banner.id);
    if (error) return toast.error("Não foi possível remover.");
    toast.success("Conteúdo removido.");
    onChanged();
  }

  return (
    <article className="border border-border bg-card p-5">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-clay">{placementLabel(banner.placement)}</p>
          <img src={banner.image_desktop} alt={banner.alt_text ?? banner.title ?? "Banner NUVE"} className="h-44 w-full bg-cream object-contain" />
          {banner.image_mobile && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-ash">Versão celular</p>
              <img src={banner.image_mobile} alt="" className="h-28 w-full bg-cream object-contain" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Local da imagem</span>
              <select value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm">
                {PLACEMENTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Ordem de exibição</span>
              <input value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título</span>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Subtítulo / texto</span>
              <textarea value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} rows={3} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto do botão</span>
              <input value={form.cta_label} onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
            </label>
            <label>
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Link do botão</span>
              <input value={form.cta_link} onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))} placeholder="/loja" className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
            </label>
            <label className="sm:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Descrição da imagem (ALT)</span>
              <input value={form.alt_text} onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))} className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="border border-input p-3 text-sm text-ash">
              <span className="block text-[10px] uppercase tracking-[0.14em]">Trocar imagem para computador</span>
              <input ref={desktopRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => replaceImage("desktop", e.target.files?.[0])} className="mt-2 block w-full text-xs" />
            </label>
            <label className="border border-input p-3 text-sm text-ash">
              <span className="block text-[10px] uppercase tracking-[0.14em]">Imagem para celular</span>
              <input ref={mobileRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(e) => replaceImage("mobile", e.target.files?.[0])} className="mt-2 block w-full text-xs" />
              {banner.image_mobile && <button type="button" onClick={removeMobile} className="mt-2 text-[10px] uppercase tracking-[0.12em] underline">Remover versão celular</button>}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Exibir no site
            </label>
            <button type="button" onClick={save} className="bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory">Salvar</button>
            <button type="button" onClick={removeBanner} className="text-[11px] uppercase tracking-[0.14em] text-ash underline">Excluir</button>
          </div>
        </div>
      </div>
    </article>
  );
}
