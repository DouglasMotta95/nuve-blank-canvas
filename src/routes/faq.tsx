import { createFileRoute } from "@tanstack/react-router";

const FAQS = [
  {
    q: "Como funciona o desconto de 10%?",
    a: "Levando 2 ou mais unidades — de qualquer produto — o desconto de 10% é aplicado automaticamente na sacola, sem cupom.",
  },
  {
    q: "Posso usar mais de um sérum na mesma rotina?",
    a: "Sim. Aplique do mais leve ao mais denso, aguardando cerca de um minuto entre eles. GHK-Cu à noite e 5 EM 1 pela manhã é uma combinação segura.",
  },
  { q: "Os produtos são veganos?", a: "Sim, todas as fórmulas são veganas e livres de testes em animais." },
  {
    q: "Em quanto tempo vejo resultado?",
    a: "Hidratação e viço aparecem nos primeiros 7 a 14 dias. Firmeza, textura e manchas respondem entre 4 e 12 semanas de uso contínuo.",
  },
  {
    q: "Quais as formas de pagamento?",
    a: "Pix, cartão de crédito em até 6x sem juros e boleto, processados com segurança pelo Mercado Pago.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "Os pedidos são despachados em até 2 dias úteis após a confirmação do pagamento. O prazo de transporte varia conforme o CEP.",
  },
  {
    q: "Posso trocar ou devolver?",
    a: "Sim. Você tem 7 dias corridos após o recebimento para solicitar devolução por arrependimento, conforme o Código de Defesa do Consumidor.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes — NUVE Advanced Skin Care" },
      {
        name: "description",
        content: "Dúvidas sobre uso dos séruns NUVE, descontos, pagamento, prazos de entrega e devolução.",
      },
      { property: "og:title", content: "FAQ — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Tudo sobre uso, entrega, pagamento e trocas." },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="eyebrow">Ajuda</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Perguntas frequentes</h1>
      <div className="mt-10 divide-y divide-border border-y border-border">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="cursor-pointer list-none text-[15px] text-ink marker:hidden">
              <span className="mr-3 text-clay">+</span>
              {f.q}
            </summary>
            <p className="mt-3 pl-6 text-sm leading-relaxed text-ash">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
