import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Crown, Download, Trash2 } from "lucide-react";
import { listVipWaitlist, removeVipEntry } from "@/lib/vip.functions";

export const Route = createFileRoute("/admin/lista-vip")({
  component: AdminListaVip,
});

function AdminListaVip() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listVipWaitlist);
  const remove = useServerFn(removeVipEntry);
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["admin-vip"],
    queryFn: () => fetchList(),
  });

  function exportCsv() {
    const header = "Nome;E-mail;WhatsApp;Data\n";
    const rows = entries
      .map((e) =>
        [e.name, e.email, e.whatsapp, new Date(e.created_at).toLocaleString("pt-BR")]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lista-vip-nuve-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl text-ink">
            <Crown className="size-6 text-clay" /> Lista VIP
          </h1>
          <p className="mt-1 text-sm text-ash">
            {entries.length} {entries.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"} aguardando o lançamento.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={entries.length === 0}
          className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-ink disabled:opacity-40"
        >
          <Download className="size-4" /> Exportar planilha
        </button>
      </div>

      {isLoading ? (
        <div className="mt-8 h-40 animate-pulse bg-cream" />
      ) : entries.length === 0 ? (
        <p className="mt-8 border border-border bg-card p-8 text-center text-sm text-ash">
          Ainda ninguém entrou na lista. Compartilhe o site para começar a captar contatos.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-[0.16em] text-ash">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Entrou em</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-ink">{e.name}</td>
                  <td className="px-4 py-3 text-ash">
                    <a
                      href={`https://wa.me/55${e.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:text-ink"
                    >
                      {e.whatsapp}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-ash">{e.email}</td>
                  <td className="px-4 py-3 text-ash">{new Date(e.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-label={`Remover ${e.name} da lista`}
                      onClick={async () => {
                        try {
                          await remove({ data: { id: e.id } });
                          qc.invalidateQueries({ queryKey: ["admin-vip"] });
                          toast.success("Removido da lista.");
                        } catch {
                          toast.error("Não foi possível remover.");
                        }
                      }}
                      className="text-ash/60 transition-colors hover:text-ink"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
