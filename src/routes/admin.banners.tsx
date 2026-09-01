import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [
      { title: "Banners — Painel NUVE" },
      { name: "description", content: "Gerencie os banners e textos da home da loja NUVE." },
      { property: "og:title", content: "Banners — Painel NUVE" },
      { property: "og:description", content: "Gestão de banners da home." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminBanners,
});

function AdminBanners() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").order("sort_order");
      return data ?? [];
    },
  });

  async function update(id: string, patch: Record<string, unknown>) {
    const { error } = await supabase.from("banners").update(patch as never).eq("id", id);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success("Banner atualizado.");
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-ink">Banners da home</h1>
      <div className="space-y-4">
        {(data ?? []).map((b: any) => (
          <article key={b.id} className="grid gap-4 border border-border bg-card p-5 md:grid-cols-[200px_1fr]">
            <img src={b.image_desktop} alt={b.title ?? "Banner"} className="w-full bg-cream object-contain" />
            <div className="space-y-3">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Título</span>
                <input
                  defaultValue={b.title ?? ""}
                  onBlur={(e) => update(b.id, { title: e.target.value })}
                  className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Subtítulo</span>
                <input
                  defaultValue={b.subtitle ?? ""}
                  onBlur={(e) => update(b.id, { subtitle: e.target.value })}
                  className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Ordem</span>
                  <input
                    defaultValue={b.sort_order}
                    onBlur={(e) => update(b.id, { sort_order: Number(e.target.value) || 0 })}
                    className="mt-1 w-24 border border-input bg-ivory px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => update(b.id, { active: !b.active })}
                  className="mt-5 h-10 border border-input px-4 text-[11px] uppercase tracking-[0.16em] text-ash"
                >
                  {b.active ? "Ativo" : "Inativo"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
