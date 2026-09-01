import { createFileRoute, Link } from "@tanstack/react-router";
import { useBanners, useProducts, useReviews } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUVE Advanced Skin Care — Séruns de alta performance" },
      {
        name: "description",
        content:
          "Séruns com tecnologia japonesa: NUVE 5 EM 1, GHK-Cu e PDRN. R$ 149,90 cada e 10% OFF levando 2 ou mais.",
      },
      { property: "og:title", content: "NUVE Advanced Skin Care" },
      {
        property: "og:description",
        content: "Skincare premium com ativos de última geração. 10% OFF levando 2 ou mais unidades.",
      },
    ],
  }),
  component: Home,
});

const PILLARS = [
  { title: "Tecnologia japonesa", text: "Formulações desenvolvidas com padrão asiático de pesquisa e pureza." },
  { title: "Ativos de última geração", text: "PDRN, GHK-Cu, niacinamida e peptídeos em concentrações eficazes." },
  { title: "Rotina simples", text: "Poucas etapas, resultado consistente. Skincare para a vida real." },
  { title: "Fórmula vegana", text: "Livre de crueldade animal, parabenos e fragrâncias sintéticas pesadas." },
];

function Home() {
  const { data: banners } = useBanners();
  const { data: products } = useProducts();
  const { data: reviews } = useReviews();
  const hero = banners?.[0];
  const secondary = banners?.slice(1) ?? [];

  return (
    <div className="nuve-reveal">
      {/* HERO — foto oficial das três mulheres */}
      <section className="bg-blush/50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="order-2 md:order-1">
            <p className="eyebrow">Advanced skin care</p>
            <h1 className="mt-3 font-display text-[38px] leading-[1.05] text-ink md:text-[56px]">
              {hero?.title ?? "Tecnologia japonesa. Ativos selecionados. Skincare para a vida real."}
            </h1>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ash">
              {hero?.subtitle ?? "Três séruns. Uma mesma proposta: realçar sua melhor versão todos os dias."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/loja"
                className="bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory"
              >
                Conheça os produtos
              </Link>
              <Link
                to="/ativos"
                className="border border-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ink"
              >
                Ativos & tecnologia
              </Link>
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-clay">
              R$ 149,90 cada · 10% OFF levando 2 ou mais
            </p>
          </div>
          <div className="order-1 md:order-2">
            {hero && (
              <img
                src={hero.image_desktop}
                alt="Três mulheres sorrindo segurando os séruns NUVE Advanced Skin Care"
                className="mx-auto w-full max-w-[560px] object-contain"
                width={1080}
                height={1080}
              />
            )}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.title}>
              <h2 className="font-display text-xl text-ink">{p.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ash">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Produtos */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <p className="eyebrow">A linha</p>
          <h2 className="mt-2 font-display text-4xl text-ink">Três séruns, um ritual</h2>
          <p className="mx-auto mt-3 max-w-[52ch] text-sm leading-relaxed text-ash">
            Cada fórmula responde a uma necessidade específica da pele. Combine dois e receba 10% OFF automático.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(products ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Banners editoriais */}
      {secondary.map((b, i) => (
        <section key={b.id} className={i % 2 === 0 ? "bg-cream" : "bg-blush/40"}>
          <div
            className={`mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 ${
              i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
            }`}
          >
            <img
              src={b.image_desktop}
              alt={b.title ?? "NUVE Advanced Skin Care"}
              loading="lazy"
              className="w-full object-contain"
            />
            <div>
              <p className="eyebrow">NUVE</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">{b.title}</h2>
              <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-ash">{b.subtitle}</p>
              <Link
                to="/loja"
                className="mt-6 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.2em] text-clay"
              >
                {b.cta_label ?? "Ver a linha"}
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* Avaliações */}
      {(reviews?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center">
            <p className="eyebrow">Quem usa</p>
            <h2 className="mt-2 font-display text-4xl text-ink">Resultados que ficam na pele</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(reviews ?? []).slice(0, 3).map((r: any) => (
              <figure key={r.id} className="border border-border bg-card p-6">
                <div className="text-clay">{"★".repeat(r.rating)}</div>
                <blockquote className="mt-3 text-sm leading-relaxed text-ash">"{r.comment}"</blockquote>
                <figcaption className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink">
                  {r.author_name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
