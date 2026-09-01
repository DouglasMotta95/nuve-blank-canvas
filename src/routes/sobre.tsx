import { createFileRoute, Link } from "@tanstack/react-router";
import { useBanners } from "@/lib/catalog";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "A Marca — NUVE Advanced Skin Care" },
      {
        name: "description",
        content:
          "Conheça a NUVE Advanced Skin Care: skincare premium com tecnologia japonesa, ativos de última geração e rotina simples.",
      },
      { property: "og:title", content: "A Marca — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Tecnologia japonesa e ativos selecionados em três séruns." },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  const { data: banners } = useBanners();
  const image = banners?.[1]?.image_desktop ?? banners?.[0]?.image_desktop;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="eyebrow">A marca</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink md:text-5xl">
        Skincare de alta performance, sem excessos
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-ash">
        A NUVE Advanced Skin Care nasceu de uma inquietação simples: por que uma rotina eficaz precisa ter dez
        etapas? Nossas fórmulas foram desenvolvidas com padrão japonês de pesquisa — pureza de ativos, texturas
        leves e concentrações que respeitam a barreira cutânea.
      </p>

      {image && (
        <img
          src={image}
          alt="Produtos NUVE Advanced Skin Care em composição editorial"
          loading="lazy"
          className="mt-10 w-full object-contain"
        />
      )}

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Pesquisa</h2>
          <p className="mt-2 text-sm leading-relaxed text-ash">
            Ativos escolhidos por evidência: PDRN, GHK-Cu, niacinamida, ácido hialurônico e peptídeos.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-ink">Simplicidade</h2>
          <p className="mt-2 text-sm leading-relaxed text-ash">
            Um sérum resolve o que antes exigia cinco frascos. Menos etapas, mais constância.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl text-ink">Consciência</h2>
          <p className="mt-2 text-sm leading-relaxed text-ash">
            Fórmulas veganas, cruelty free e embalagens pensadas para durar todo o tratamento.
          </p>
        </div>
      </div>

      <Link to="/loja" className="mt-12 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
        Conhecer a linha
      </Link>
    </div>
  );
}
