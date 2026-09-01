import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  social_proof: { enabled: boolean };
  order_emails: { customer: boolean; admin: boolean; admin_email: string };
};

const DEFAULTS: Settings = {
  social_proof: { enabled: true },
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
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-ink">Configurações da loja</h1>
        <p className="mt-1 text-sm text-ash">Notificações de prova social e avisos de pedido.</p>
      </header>

      <section className="border border-border bg-card p-5">
        <h2 className="font-display text-2xl text-ink">Prova social</h2>
        <p className="mt-1 text-sm text-ash">
          Mostra no site avisos discretos do tipo “Ana de São Paulo/SP acabou de comprar”, usando pedidos reais dos
          últimos 14 dias (apenas primeiro nome e cidade).
        </p>
        <Toggle
          label="Exibir avisos de compra recente"
          checked={s.social_proof.enabled}
          onChange={(v) => save("social_proof", { enabled: v })}
        />
      </section>

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
