import { useState } from "react";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { joinVipList } from "@/lib/vip.functions";

export function VipListSection() {
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <section className="border-y border-border bg-ink py-14 text-ivory sm:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <p className="eyebrow !text-ivory/60">Acesso antecipado</p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Entre para a Lista VIP NUVE</h2>
          <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-ivory/75">
            Deixe seu nome, WhatsApp e e-mail e seja avisada em primeira mão quando os produtos chegarem —
            com prioridade na fila e condições exclusivas para quem estiver na lista.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ivory/80">
            <li className="flex items-center gap-2"><Crown className="size-4 text-ivory/70" /> Aviso antes de todo mundo</li>
            <li className="flex items-center gap-2"><Crown className="size-4 text-ivory/70" /> Prioridade quando o estoque abrir</li>
            <li className="flex items-center gap-2"><Crown className="size-4 text-ivory/70" /> Condições exclusivas da lista</li>
          </ul>
        </div>

        {done ? (
          <div className="border border-ivory/25 bg-ivory/5 p-8 text-center">
            <p className="font-display text-2xl">Você está na lista!</p>
            <p className="mt-2 text-sm text-ivory/75">Vamos te avisar pelo WhatsApp e e-mail assim que os produtos chegarem.</p>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await joinVipList({ data: { name: form.name, email: form.email, whatsapp: form.whatsapp } });
                setDone(true);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Não foi possível entrar na lista.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-ivory/60">Nome</span>
              <input
                value={form.name}
                maxLength={120}
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome"
                className="mt-1 w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ivory/40 focus:border-ivory"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-ivory/60">WhatsApp (com DDD)</span>
              <input
                value={form.whatsapp}
                maxLength={20}
                required
                inputMode="tel"
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(19) 99999-0000"
                className="mt-1 w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ivory/40 focus:border-ivory"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.16em] text-ivory/60">E-mail</span>
              <input
                type="email"
                value={form.email}
                maxLength={160}
                required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="mt-1 w-full border border-ivory/25 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ivory/40 focus:border-ivory"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-ivory px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ink transition-opacity disabled:opacity-50"
            >
              {busy ? "Enviando..." : "Quero entrar na lista VIP"}
            </button>
            <p className="text-[11px] leading-relaxed text-ivory/50">
              Usamos seus dados apenas para avisar sobre a chegada dos produtos. Sem spam.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
