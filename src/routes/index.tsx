import { createFileRoute, Link } from "@tanstack/react-router";
import { useBanners, useProducts, useReviews } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { AutoCarousel } from "@/components/site/AutoCarousel";
import { HeroVisualSlider } from "@/components/site/HeroVisualSlider";
import g1 from "@/assets/img-20260831-wa0026.jpg.asset.json";
import g2 from "@/assets/img-20260831-wa0065.jpg.asset.json";
import g3 from "@/assets/img-20260831-wa0066.jpg.asset.json";
import g4 from "@/assets/img-20260831-wa0073.jpg.asset.json";
import g5 from "@/assets/img-20260831-wa0079.jpg.asset.json";
import g6 from "@/assets/img-20260831-wa0067.jpg.asset.json";
import g7 from "@/assets/img-20260831-wa0078.jpg.asset.json";
import g8 from "@/assets/img-20260831-wa0081.jpg.asset.json";
import g9 from "@/assets/img-20260831-wa0036.jpg.asset.json";
import g10 from "@/assets/img-20260831-wa0037.jpg.asset.json";

const GALLERY_FALLBACK = [
  { url: g2.url, alt: "Séruns NUVE GHK-Cu, 5 EM 1 e PDRN lado a lado" },
  { url: g3.url, alt: "Séruns NUVE com suas embalagens" },
  { url: g4.url, alt: "NUVE GHK-Cu e 5 EM 1 com as caixas originais" },
  { url: g5.url, alt: "NUVE 5 EM 1 Serum com respingos de água e embalagem" },
  { url: g6.url, alt: "NUVE PDRN Copper Peptide com a embalagem" },
  { url: g7.url, alt: "NUVE PDRN Copper Peptide em textura de gel rosa" },
  { url: g8.url, alt: "Frasco do NUVE 5 EM 1 Serum em fundo claro" },
  { url: g9.url, alt: "NUVE 5 EM 1 Serum 30 ml" },
  { url: g10.url, alt: "Mulheres aplicando sérum NUVE" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUVE Advance Skincare — Tecnologia, ativos e autocuidado" },
      {
        name: "description",
        content:
          "Conheça os séruns NUVE. Skincare sofisticado, formulações desenvolvidas no Japão e 10% OFF levando 2 ou mais unidades elegíveis.",
      },
      { property: "og:title", content: "NUVE Advance Skincare" },
      {
        property: "og:description",
        content: "Tecnologia japonesa. Ativos selecionados. Skincare para a vida real.",
      },
    ],
  }),
  component: Home,
});

const PILLARS = [
  {
    title: "Formulações desenvolvidas no Japão",
    text: "Tecnologia e conhecimento em skincare traduzidos para uma rotina moderna de cuidados com a pele.",
  },
  {
    title: "Ativos selecionados",
    text: "Fórmulas pensadas para unir cuidado, praticidade e uma experiência sofisticada no dia a dia.",
  },
  {
    title: "Menos complicação",
    text: "Uma proposta de skincare mais simples, sem perder intenção, tecnologia e sofisticação.",
  },
  {
    title: "Beleza para a vida real",
    text: "Autocuidado que acompanha a rotina, com produtos que fazem sentido no uso diário.",
  },
];

function Home() {
  const { data: banners } = useBanners();
  const { data: products } = useProducts();
  const { data: reviews } = useReviews();

  const heroBanners = (banners ?? []).filter((banner) => banner.placement === "hero");
  const hero = heroBanners[0];
  const japan = (banners ?? []).find((banner) => banner.placement === "japan");
  const editorial = (banners ?? []).filter((banner) =>
    ["science", "editorial", "promotional", "fixed"].includes(banner.placement),
  );
  const lineDetails = (banners ?? []).filter((banner) => banner.placement === "line_details");

  const heroSlides = heroBanners.length
    ? heroBanners.map((banner) => ({
        id: banner.id,
        image_desktop: banner.image_desktop,
        image_mobile: banner.image_mobile,
        title: banner.alt_text ?? banner.title,
      }))
    : [
        {
          id: "fallback-hero",
          image_desktop: g1.url,
          image_mobile: null,
          title: "NUVE Advance Skincare",
        },
      ];

  const gallerySlides = lineDetails.length
    ? lineDetails.map((banner) => ({
        url: banner.image_desktop,
        alt: banner.alt_text ?? banner.title ?? "NUVE Advance Skincare",
      }))
    : GALLERY_FALLBACK;

  return (
    <div className="nuve-reveal overflow-x-hidden">
      <section className="bg-blush/45">
        <div className="w-full border-b border-border/60 bg-cream">
          <HeroVisualSlider slides={heroSlides} />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-4 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow">NUVE Advance Skincare</p>
            <h1 className="mx-auto mt-3 max-w-[17ch] font-display text-[38px] leading-[1.02] text-ink sm:text-[46px] md:text-[54px] lg:text-[62px]">
              {hero?.title ?? "Tecnologia japonesa. Ativos selecionados. Skincare para a vida real."}
            </h1>
            <p className="mx-auto mt-5 max-w-[58ch] text-[15px] leading-relaxed text-ash">
              {hero?.subtitle ??
                "A Nuve une a sofisticação do skincare japonês a fórmulas cuidadosamente desenvolvidas com ativos selecionados para transformar o cuidado com a pele em uma experiência simples, prática e especial."}
            </p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to="/loja" className="inline-flex min-h-12 items-center justify-center bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
                Conheça os produtos
              </Link>
              <Link
                to="/sobre"
                className="inline-flex min-h-12 items-center justify-center border border-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ink"
              >
                Conheça a NUVE
              </Link>
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-clay sm:tracking-[0.18em]">
              10% OFF levando 2 ou mais unidades elegíveis
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 xl:px-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="border-t border-clay/35 pt-4">
              <h2 className="font-display text-xl leading-tight text-ink">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-18 lg:px-4 lg:py-20">
        <div className="text-center">
          <p className="eyebrow">A linha</p>
          <h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">Séruns para diferentes formas de cuidar.</h2>
          <p className="mx-auto mt-4 max-w-[58ch] text-sm leading-relaxed text-ash">
            Escolha a fórmula que mais combina com sua rotina ou combine dois produtos e receba 10% OFF automático quando elegível.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {(products ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {japan && (
        <section className="overflow-hidden bg-[#2b2528] text-ivory">
          <picture className="block w-full bg-cream">
            {japan.image_mobile && <source media="(max-width: 639px)" srcSet={japan.image_mobile} />}
            <img
              src={japan.image_desktop}
              alt={japan.alt_text ?? "NUVE — tecnologia, formulação e inspiração japonesa"}
              loading="lazy"
              className="block h-auto w-full object-contain object-center"
            />
          </picture>
          <div className="mx-auto max-w-6xl px-5 py-11 sm:px-8 sm:py-12 lg:py-16">
            <p className="text-[10px] uppercase tracking-[0.28em] text-champagne">Inspiração japonesa</p>
            <h2 className="mt-3 max-w-[15ch] font-display text-4xl leading-[1.04] md:text-5xl">
              {japan.title ?? "Formulações desenvolvidas no Japão"}
            </h2>
            <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-ivory/75">
              {japan.subtitle ??
                "A NUVE nasce inspirada na sofisticação do skincare japonês, unindo tecnologia, conhecimento em formulação e ativos selecionados a uma rotina moderna de cuidados com a pele."}
            </p>
            <Link
              to="/sobre"
              className="mt-7 inline-block border-b border-champagne pb-1 text-[11px] uppercase tracking-[0.2em] text-champagne"
            >
              {japan.cta_label ?? "Descubra a história da NUVE"}
            </Link>
          </div>
        </section>
      )}

      <section className="border-y border-border bg-cream/60 py-12 sm:py-14 md:py-16">
        <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5 lg:px-6">
          <div className="text-center">
            <p className="eyebrow">Universo NUVE</p>
            <h2 className="mt-2 font-display text-4xl text-ink">A linha em detalhes</h2>
          </div>
          <div className="mt-8 overflow-hidden border border-border bg-card">
            <AutoCarousel slides={gallerySlides} />
          </div>
        </div>
      </section>

      {editorial.map((b, i) => (
        <section key={b.id} className={i % 2 === 0 ? "bg-ivory" : "bg-blush/35"}>
          <picture className="block w-full bg-cream/50">
            {b.image_mobile && <source media="(max-width: 639px)" srcSet={b.image_mobile} />}
            <img
              src={b.image_desktop}
              alt={b.alt_text ?? b.title ?? "NUVE Advance Skincare"}
              loading="lazy"
              className="block h-auto w-full object-contain object-center"
            />
          </picture>
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14">
            <p className="eyebrow">NUVE</p>
            {b.title && <h2 className="mt-3 max-w-[18ch] font-display text-3xl leading-tight text-ink md:text-4xl xl:text-5xl">{b.title}</h2>}
            {b.subtitle && <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ash">{b.subtitle}</p>}
            <Link
              to="/loja"
              className="mt-6 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.2em] text-clay"
            >
              {b.cta_label ?? "Ver a linha"}
            </Link>
          </div>
        </section>
      ))}

      {(reviews?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16 lg:px-4">
          <div className="text-center">
            <p className="eyebrow">Experiências NUVE</p>
            <h2 className="mt-2 font-display text-4xl text-ink">O que nossas clientes contam</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(reviews ?? []).slice(0, 3).map((r) => (
              <figure key={r.id} className="border border-border bg-card p-6">
                <div className="text-clay">{"★".repeat(r.rating)}</div>
                <blockquote className="mt-3 text-sm leading-relaxed text-ash">“{r.comment}”</blockquote>
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
