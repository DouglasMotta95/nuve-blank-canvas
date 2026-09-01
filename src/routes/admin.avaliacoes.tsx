import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/avaliacoes")({
  head: () => ({ meta: [{ title: "Avaliações — Painel NUVE" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminAvaliacoes,
});

type ReviewRow = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  approved: boolean;
  created_at: string;
  products: { name: string } | null;
};

function AdminAvaliacoes() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async (): Promise<ReviewRow[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,product_id,author_name,rating,comment,approved,created_at,products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ReviewRow[];
    },
  });

  function refresh() {
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-ink">Avaliações</h1>
        <p className="mt-1 text-sm text-ash">Aprove, oculte ou ajuste avaliações exibidas no site sem apagar o histórico.</p>
      </header>
      {isLoading && <div className="h-40 animate-pulse bg-cream" />}
      <div className="space-y-4">
        {(data ?? []).map((review) => <ReviewEditor key={review.id} review={review} onChanged={refresh} />)}
      </div>
    </div>
  );
}

function ReviewEditor({ review, onChanged }: { review: ReviewRow; onChanged: () => void }) {
  const [form, setForm] = useState({
    author_name: review.author_name,
    rating: String(review.rating),
    comment: review.comment ?? "",
    approved: review.approved,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    const rating = Number.parseInt(form.rating, 10);
    if (!form.author_name.trim()) return toast.error("Informe o nome da cliente.");
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return toast.error("A nota deve ficar entre 1 e 5.");
    setSaving(true);
    try {
      const { error } = await supabase.from("reviews").update({
        author_name: form.author_name.trim().slice(0, 120),
        rating,
        comment: form.comment.trim().slice(0, 1200) || null,
        approved: form.approved,
      }).eq("id", review.id);
      if (error) throw error;
      toast.success("Avaliação atualizada.");
      onChanged();
    } catch {
      toast.error("Não foi possível salvar a avaliação.");
    } finally {
      setSaving(false);
    }
  }

  const input = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
  return (
    <article className="border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl text-ink">{review.products?.name ?? "Produto"}</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-ash">{new Date(review.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={form.approved} onChange={(e) => setForm((current) => ({ ...current, approved: e.target.checked }))} />
          Exibir no site
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Nome</span><input value={form.author_name} onChange={(e) => setForm((current) => ({ ...current, author_name: e.target.value }))} className={input} /></label>
        <label><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Nota</span><select value={form.rating} onChange={(e) => setForm((current) => ({ ...current, rating: e.target.value }))} className={input}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} estrelas</option>)}</select></label>
        <label className="sm:col-span-2"><span className="text-[11px] uppercase tracking-[0.14em] text-ash">Comentário</span><textarea value={form.comment} onChange={(e) => setForm((current) => ({ ...current, comment: e.target.value }))} rows={4} className={input} /></label>
      </div>
      <button type="button" disabled={saving} onClick={save} className="mt-4 bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ivory disabled:opacity-60">{saving ? "Salvando…" : "Salvar avaliação"}</button>
    </article>
  );
}
