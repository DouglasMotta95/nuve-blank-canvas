export const ORDER_STEPS = [
  { key: "aguardando_pagamento", label: "Pedido recebido", hint: "Aguardando confirmação do pagamento" },
  { key: "pagamento_aprovado", label: "Pagamento aprovado", hint: "Pagamento confirmado" },
  { key: "em_separacao", label: "Em separação", hint: "Preparando seu pedido" },
  { key: "enviado", label: "Enviado", hint: "A caminho do seu endereço" },
  { key: "entregue", label: "Entregue", hint: "Pedido entregue" },
] as const;

export const STATUS_LABEL: Record<string, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pagamento_aprovado: "Pagamento aprovado",
  em_separacao: "Em separação",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export type OrderEvent = {
  id: string;
  status: string;
  payment_status: string | null;
  tracking_code: string | null;
  note: string | null;
  created_at: string;
};

export function OrderTimeline({
  status,
  trackingCode,
  events,
}: {
  status: string;
  trackingCode?: string | null;
  events?: OrderEvent[];
}) {
  const cancelled = status === "cancelado";
  const currentIndex = ORDER_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="space-y-6">
      {cancelled ? (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Este pedido foi cancelado. Em caso de dúvida, fale com a gente pelo e-mail nuveadvanced@gmail.com.
        </p>
      ) : (
        <ol className="space-y-4">
          {ORDER_STEPS.map((step, i) => {
            const done = currentIndex >= i;
            const active = currentIndex === i;
            return (
              <li key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${done ? "bg-clay" : "bg-border"} ${
                      active ? "ring-4 ring-clay/20" : ""
                    }`}
                  />
                  {i < ORDER_STEPS.length - 1 && (
                    <span className={`w-px flex-1 ${currentIndex > i ? "bg-clay" : "bg-border"}`} />
                  )}
                </div>
                <div className="pb-2">
                  <p className={`text-sm ${done ? "text-ink" : "text-ash"}`}>{step.label}</p>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-ash">{step.hint}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {trackingCode && (
        <div className="border border-border bg-cream/60 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-ash">Código de rastreio</p>
          <p className="mt-1 font-display text-xl text-ink">{trackingCode}</p>
          <a
            href={`https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(trackingCode)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block border-b border-clay text-[11px] uppercase tracking-[0.16em] text-clay"
          >
            Rastrear nos Correios
          </a>
        </div>
      )}

      {events && events.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-ash">Histórico</p>
          <ul className="mt-2 divide-y divide-border border-y border-border">
            {events
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span className="text-ink">{STATUS_LABEL[e.status] ?? e.status}</span>
                  <span className="text-ash">
                    {new Date(e.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
