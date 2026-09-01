import { createFileRoute, notFound } from "@tanstack/react-router";

const PAGES: Record<string, { title: string; description: string; body: string[] }> = {
  privacidade: {
    title: "Política de Privacidade",
    description: "Como a NUVE Advanced Skin Care coleta, usa e protege os seus dados pessoais.",
    body: [
      "Coletamos apenas os dados necessários para processar pedidos, emitir notas e realizar entregas: nome, e-mail, telefone, CPF e endereço.",
      "Dados de pagamento são processados diretamente pelo Mercado Pago. A NUVE não armazena números de cartão.",
      "Utilizamos o e-mail para status de pedido e, com o seu consentimento, para comunicações de marketing — o descadastro está em todos os envios.",
      "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo nosso canal de contato, conforme a LGPD.",
    ],
  },
  trocas: {
    title: "Trocas e Devoluções",
    description: "Prazos e condições para troca ou devolução de produtos NUVE Advanced Skin Care.",
    body: [
      "Arrependimento: você tem até 7 dias corridos após o recebimento para solicitar a devolução, com reembolso integral.",
      "Produto com defeito ou avaria no transporte: registre o caso em até 7 dias com fotos do item e da embalagem.",
      "O produto deve ser devolvido com lacre e embalagem originais quando a solicitação for por arrependimento.",
      "Após a aprovação da análise, o reembolso ocorre pelo mesmo meio de pagamento em até 10 dias úteis.",
    ],
  },
  envio: {
    title: "Envio e Prazos",
    description: "Prazos de postagem, transporte e rastreio dos pedidos NUVE Advanced Skin Care.",
    body: [
      "Pedidos são separados e despachados em até 2 dias úteis após a confirmação do pagamento.",
      "O prazo de transporte varia conforme o CEP de entrega e é informado no checkout.",
      "O código de rastreio é enviado por e-mail assim que a etiqueta é postada.",
      "Endereços incorretos ou incompletos podem gerar devolução ao remetente e novo custo de envio.",
    ],
  },
  termos: {
    title: "Termos de Uso",
    description: "Condições de uso do site e da loja online NUVE Advanced Skin Care.",
    body: [
      "Ao navegar e comprar neste site você concorda com estes termos e com a nossa política de privacidade.",
      "Os preços, promoções e disponibilidade de estoque podem ser alterados sem aviso prévio.",
      "As imagens são ilustrativas; pequenas variações de tonalidade podem ocorrer entre telas.",
      "Os conteúdos deste site não substituem avaliação dermatológica individual.",
    ],
  },
};

export const Route = createFileRoute("/politicas/$slug")({
  loader: ({ params }) => {
    const page = PAGES[params.slug];
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Política não encontrada — NUVE" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${loaderData.title} — NUVE Advanced Skin Care` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: `${loaderData.title} — NUVE Advanced Skin Care` },
        { property: "og:description", content: loaderData.description },
      ],
    };
  },
  component: PoliticaPage,
});

function PoliticaPage() {
  const page = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="eyebrow">Institucional</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{page.title}</h1>
      <div className="mt-8 space-y-4">
        {page.body.map((p) => (
          <p key={p} className="text-[15px] leading-relaxed text-ash">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
