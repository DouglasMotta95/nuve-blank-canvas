import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  SOCIAL_PROOF_DEFAULT,
  SOCIAL_PROOF_STYLES,
  renderTemplate,
  type SocialProofSetting,
} from "@/components/site/SocialProof";

export const Route = createFileRoute("/admin/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Painel NUVE" },
      { name: "description", content: "Notificações da loja, prova social e avisos por e-mail." },
      { property: "og:title", content: "Configurações — Painel NUVE" },
      { property: "og:description", content: "Ajustes da loja NUVE." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminConfig,
});

type Settings = {
  social_proof: SocialProofSetting;
  whatsapp: { enabled: boolean; phone: string; message: string };
  order_emails: { customer: boolean; admin: boolean; admin_email: string };
};

const DEFAULTS: Settings = {
  social_proof: SOCIAL_PROOF_DEFAULT,
  whatsapp: {
    enabled: true,
    phone: "19991227755",
    message: "Olá! Gostaria de saber mais sobre os séruns NUVE Advanced.",
  },
  order_emails: { customer: true, admin: true, admin_email: "nuveadvanced@gmail.com" },
};


function AdminConfig() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
      return {
        social_proof: { ...DEFAULTS.social_proof, ...(map["social_proof"] ?? {}) },
        whatsapp: { ...DEFAULTS.whatsapp, ...(map["whatsapp"] ?? {}) },
        order_emails: { ...DEFAULTS.order_emails, ...(map["order_emails"] ?? {}) },
      } as Settings;
    },
  });

  const s = data ?? DEFAULTS;


  async function save(key: keyof Settings, value: unknown) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: value as never, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    toast.success("Configuração salva.");
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
    qc.invalidateQueries({ queryKey: ["social-proof"] });
    qc.invalidateQueries({ queryKey: ["setting", "whatsapp"] });
    qc.invalidateQueries({ queryKey: ["setting", "social_proof"] });
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-ink">Configurações da loja</h1>
        <p className="mt-1 text-sm text-ash">Atendimento no WhatsApp, prova social e avisos de pedido.</p>

      </header>

      <section className="border border-border bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Atendimento no WhatsApp</h2>
        <p className="mt-1 text-sm text-ash">
          Exibe um botão flutuante em todas as páginas da loja. Informe o número com DDD (ex.: 11 91234-5678).
        </p>
        <Toggle
          label="Exibir botão do WhatsApp"
          checked={s.whatsapp.enabled}
          onChange={(v) => save("whatsapp", { ...s.whatsapp, enabled: v })}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Número (com DDD)</span>
            <input
              defaultValue={s.whatsapp.phone}
              placeholder="11 91234-5678"
              onBlur={(e) => save("whatsapp", { ...s.whatsapp, phone: e.target.value.trim() })}
              className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Mensagem inicial</span>
            <input
              defaultValue={s.whatsapp.message}
              onBlur={(e) => save("whatsapp", { ...s.whatsapp, message: e.target.value })}
              className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>


      <SocialProofSection value={s.social_proof} onSave={(v) => save("social_proof", v)} />


      <section className="border border-border bg-card p-5">
        <h2 className="font-display text-2xl text-ink">E-mails de pedido</h2>
        <p className="mt-1 text-sm text-ash">
          Avisos automáticos a cada mudança de status do pedido (pagamento aprovado, em separação, enviado, entregue,
          cancelado).
        </p>
        <Toggle
          label="Avisar a cliente por e-mail"
          checked={s.order_emails.customer}
          onChange={(v) => save("order_emails", { ...s.order_emails, customer: v })}
        />
        <Toggle
          label="Avisar a administradora por e-mail"
          checked={s.order_emails.admin}
          onChange={(v) => save("order_emails", { ...s.order_emails, admin: v })}
        />
        <label className="mt-4 block max-w-sm">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">E-mail da administradora</span>
          <input
            defaultValue={s.order_emails.admin_email}
            onBlur={(e) => save("order_emails", { ...s.order_emails, admin_email: e.target.value.trim() })}
            className="mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm"
          />
        </label>
      </section>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mt-4 flex items-center gap-3 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[color:var(--clay,#b98a7a)]"
      />
      {label}
    </label>
  );
}

const inputCls = "mt-1 w-full border border-input bg-ivory px-3 py-2 text-sm";
const PREVIEW_ITEM = { name: "Ana", city: "Campinas/SP", product: "NUVE 5 EM 1", minutesAgo: 12 };

function SocialProofSection({
  value,
  onSave,
}: {
  value: SocialProofSetting;
  onSave: (v: SocialProofSetting) => void;
}) {
  const [cfg, setCfg] = useState<SocialProofSetting>(value);
  function set<K extends keyof SocialProofSetting>(k: K, v: SocialProofSetting[K]) {
    setCfg((c) => ({ ...c, [k]: v }));
  }
  const st = SOCIAL_PROOF_STYLES[cfg.style] ?? SOCIAL_PROOF_STYLES.claro;

  return (
    <section className="border border-border bg-card p-5">
      <h2 className="font-display text-2xl text-ink">Prova social</h2>
      <p className="mt-1 text-sm text-ash">
        Avisos discretos de compras reais dos últimos 14 dias (apenas primeiro nome e cidade). Use as etiquetas{" "}
        <code>{"{nome}"}</code>, <code>{"{cidade}"}</code>, <code>{"{produto}"}</code> e <code>{"{tempo}"}</code> para
        montar o texto do jeito que preferir.
      </p>

      <Toggle
        label="Exibir avisos de compra recente"
        checked={cfg.enabled}
        onChange={(v) => set("enabled", v)}
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Texto principal</span>
          <input value={cfg.template} maxLength={140} onChange={(e) => set("template", e.target.value)} className={inputCls} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Linha de apoio (deixe vazio para ocultar)</span>
          <input value={cfg.subtitle} maxLength={140} onChange={(e) => set("subtitle", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Estilo do aviso</span>
          <select value={cfg.style} onChange={(e) => set("style", e.target.value as SocialProofSetting["style"])} className={inputCls}>
            <option value="claro">Claro (padrão)</option>
            <option value="escuro">Escuro</option>
            <option value="blush">Blush</option>
            <option value="minimal">Minimalista</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Posição na tela</span>
          <select
            value={cfg.position}
            onChange={(e) => set("position", e.target.value as SocialProofSetting["position"])}
            className={inputCls}
          >
            <option value="bottom-left">Canto inferior esquerdo</option>
            <option value="bottom-right">Canto inferior direito</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Tempo visível (segundos)</span>
          <input
            type="number"
            min={2}
            max={30}
            value={cfg.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ash">Intervalo entre avisos (segundos)</span>
          <input
            type="number"
            min={4}
            max={120}
            value={cfg.interval}
            onChange={(e) => set("interval", Number(e.target.value))}
            className={inputCls}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ash">Prévia</p>
        <div className={`mt-2 inline-flex max-w-[19rem] items-start gap-3 px-4 py-3 ${st.card}`}>
          <span className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
          <div className="text-left">
            <p className={st.title}>{renderTemplate(cfg.template, PREVIEW_ITEM)}</p>
            {cfg.subtitle?.trim() && <p className={`mt-0.5 ${st.meta}`}>{renderTemplate(cfg.subtitle, PREVIEW_ITEM)}</p>}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSave(cfg)}
        className="mt-5 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ivory"
      >
        Salvar prova social
      </button>
    </section>
  );
}
