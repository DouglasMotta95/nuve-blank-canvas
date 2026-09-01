import { createFileRoute, Link } from "@tanstack/react-router";
import { useBanners, useProducts, useReviews, useSetting } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { AutoCarousel } from "@/components/site/AutoCarousel";
import { HeroVisualSlider } from "@/components/site/HeroVisualSlider";
import g1 from "@/assets/img-20260831-wa0026.jpg.asset.json";

const DEFAULT_PILLARS = [
  { title: "Formulações desenvolvidas no Japão", text: "Tecnologia e conhecimento em skincare traduzidos para uma rotina moderna de cuidados com a pele." },
  { title: "Ativos selecionados", text: "Fórmulas pensadas para unir cuidado, praticidade e uma experiência sofisticada no dia a dia." },
  { title: "Menos complicação", text: "Uma proposta de skincare mais simples, sem perder intenção, tecnologia e sofisticação." },
  { title: "Beleza para a vida real", text: "Autocuidado que acompanha a rotina, com produtos que fazem sentido no uso diário." },
];

type HomeContent = {
  hero_eyebrow?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_primary_label?: string;
  hero_secondary_label?: string;
  products_eyebrow?: string;
  products_title?: string;
  products_subtitle?: string;
  line_details_eyebrow?: string;
  line_details_title?: string;
  reviews_eyebrow?: string;
  reviews_title?: string;
  show_pillars?: boolean;
  show_products?: boolean;
  show_japan?: boolean;
  show_line_details?: boolean;
  show_editorial?: boolean;
  show_reviews?: boolean;
  pillars?: Array<{ title: string; text: string }>;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NUVE Advance Skincare — Tecnologia, ativos e autocuidado" },
      { name: "description", content: "Conheça os séruns NUVE. Skincare sofisticado, formulações desenvolvidas no Japão e 10% OFF levando 2 ou mais unidades elegíveis." },
      { property: "og:title", content: "NUVE Advance Skincare" },
      { property: "og:description", content: "Tecnologia japonesa. Ativos selecionados. Skincare para a vida real." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: banners } = useBanners();
  const { data: products } = useProducts();
  const { data: reviews } = useReviews();
  const { data: home } = useSetting<HomeContent>("home_content");

  const heroBanners = (banners ?? []).filter((banner) => banner.placement === "hero");
  const hero = heroBanners[0];
  const japan = (banners ?? []).find((banner) => banner.placement === "japan");
  const editorial = (banners ?? []).filter((banner) => ["science", "editorial", "promotional", "fixed"].includes(banner.placement));
  const lineDetails = (banners ?? []).filter((banner) => banner.placement === "line_details");
  const pillars = home?.pillars?.length ? home.pillars : DEFAULT_PILLARS;
  const featuredProducts = (products ?? []).filter((product) => product.featured);

  const heroSlides = heroBanners.length
    ? heroBanners.map((banner) => ({ id: banner.id, image_desktop: banner.image_desktop, image_mobile: banner.image_mobile, title: banner.alt_text ?? banner.title }))
    : [{ id: "fallback-hero", image_desktop: g1.url, image_mobile: null, title: "NUVE Advance Skincare" }];

  const gallerySlides = lineDetails.map((banner) => ({
    url: banner.image_desktop,
    alt: banner.alt_text ?? banner.title ?? "NUVE Advance Skincare",
  }));

  return (
    <div className="nuve-reveal overflow-x-hidden">
      <section className="bg-blush/45">
        <div className="w-full border-b border-border/60 bg-cream"><HeroVisualSlider slides={heroSlides} /></div>
        <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-11 lg:px-4 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="eyebrow">{home?.hero_eyebrow ?? "NUVE Advance Skincare"}</p>
            <h1 className="mx-auto mt-3 max-w-[17ch] font-display text-[38px] leading-[1.02] text-ink sm:text-[46px] md:text-[54px] lg:text-[62px]">{hero?.title ?? home?.hero_title ?? "Tecnologia japonesa. Ativos selecionados. Skincare para a vida real."}</h1>
            <p className="mx-auto mt-5 max-w-[58ch] text-[15px] leading-relaxed text-ash">{hero?.subtitle ?? home?.hero_subtitle ?? "A Nuve une a sofisticação do skincare japonês a fórmulas cuidadosamente desenvolvidas com ativos selecionados para transformar o cuidado com a pele em uma experiência simples, prática e especial."}</p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to="/loja" className="inline-flex min-h-12 items-center justify-center bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">{home?.hero_primary_label ?? "Conheça os produtos"}</Link>
              <Link to="/sobre" className="inline-flex min-h-12 items-center justify-center border border-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ink">{home?.hero_secondary_label ?? "Conheça a NUVE"}</Link>
            </div>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-clay sm:tracking-[0.18em]">10% OFF levando 2 ou mais unidades elegíveis</p>
          </div>
        </div>
      </section>

      {home?.show_pillars !== false && (
        <section className="border-y border-border bg-cream">
          <div className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:grid-cols-2 sm:px-6 xl:grid-cols-4 xl:px-4">
            {pillars.map((pillar) => <div key={pillar.title} className="border-t border-clay/35 pt-4"><h2 className="font-display text-xl leading-tight text-ink">{pillar.title}</h2><p className="mt-2 text-sm leading-relaxed text-ash">{pillar.text}</p></div>)}
          </div>
        </section>
      )}

      {home?.show_products !== false && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-18 lg:px-4 lg:py-20">
          <div className="text-center"><p className="eyebrow">{home?.products_eyebrow ?? "A linha"}</p><h2 className="mt-2 font-display text-4xl text-ink md:text-5xl">{home?.products_title ?? "Séruns para diferentes formas de cuidar."}</h2><p className="mx-auto mt-4 max-w-[58ch] text-sm leading-relaxed text-ash">{home?.products_subtitle ?? "Escolha a fórmula que mais combina com sua rotina ou combine dois produtos e receba 10% OFF automático quando elegível."}</p></div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </section>
      )}

      {home?.show_japan !== false && japan && (
        <section className="overflow-hidden bg-[#2b2528] text-ivory">
          <picture className="block w-full bg-cream">{japan.image_mobile && <source media="(max-width: 639px)" srcSet={japan.image_mobile} />}<img src={japan.image_desktop} alt={japan.alt_text ?? "NUVE — tecnologia, formulação e inspiração japonesa"} loading="lazy" className="block h-auto w-full object-contain object-center" /></picture>
          <div className="mx-auto max-w-6xl px-5 py-11 sm:px-8 sm:py-12 lg:py-16"><p className="text-[10px] uppercase tracking-[0.28em] text-champagne">Inspiração japonesa</p><h2 className="mt-3 max-w-[15ch] font-display text-4xl leading-[1.04] md:text-5xl">{japan.title ?? "Formulações desenvolvidas no Japão"}</h2><p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-ivory/75">{japan.subtitle ?? "A NUVE nasce inspirada na sofisticação do skincare japonês, unindo tecnologia, conhecimento em formulação e ativos selecionados a uma rotina moderna de cuidados com a pele."}</p><a href={japan.cta_link || "/sobre"} className="mt-7 inline-block border-b border-champagne pb-1 text-[11px] uppercase tracking-[0.2em] text-champagne">{japan.cta_label ?? "Descubra a história da NUVE"}</a></div>
        </section>
      )}

      {home?.show_line_details !== false && gallerySlides.length > 0 && (
        <section className="border-y border-border bg-cream/60 py-12 sm:py-14 md:py-16">
          <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5 lg:px-6"><div className="text-center"><p className="eyebrow">{home?.line_details_eyebrow ?? "Universo NUVE"}</p><h2 className="mt-2 font-display text-4xl text-ink">{home?.line_details_title ?? "A linha em detalhes"}</h2></div><div className="mt-8 overflow-hidden border border-border bg-card"><AutoCarousel slides={gallerySlides} /></div></div>
        </section>
      )}

      {home?.show_editorial !== false && editorial.map((banner, index) => (
        <section key={banner.id} className={index % 2 === 0 ? "bg-ivory" : "bg-blush/35"}>
          <picture className="block w-full bg-cream/50">{banner.image_mobile && <source media="(max-width: 639px)" srcSet={banner.image_mobile} />}<img src={banner.image_desktop} alt={banner.alt_text ?? banner.title ?? "NUVE Advance Skincare"} loading="lazy" className="block h-auto w-full object-contain object-center" /></picture>
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14"><p className="eyebrow">NUVE</p>{banner.title && <h2 className="mt-3 max-w-[18ch] font-display text-3xl leading-tight text-ink md:text-4xl xl:text-5xl">{banner.title}</h2>}{banner.subtitle && <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ash">{banner.subtitle}</p>}<a href={banner.cta_link || "/loja"} className="mt-6 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.2em] text-clay">{banner.cta_label ?? "Ver a linha"}</a></div>
        </section>
      ))}

      {home?.show_reviews !== false && (reviews?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16 lg:px-4">
          <div className="text-center"><p className="eyebrow">{home?.reviews_eyebrow ?? "Experiências NUVE"}</p><h2 className="mt-2 font-display text-4xl text-ink">{home?.reviews_title ?? "O que nossas clientes contam"}</h2></div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{(reviews ?? []).slice(0, 3).map((review) => <figure key={review.id} className="border border-border bg-card p-6"><div className="text-clay">{"★".repeat(review.rating)}</div><blockquote className="mt-3 text-sm leading-relaxed text-ash">“{review.comment}”</blockquote><figcaption className="mt-4 text-[11px] uppercase tracking-[0.18em] text-ink">{review.author_name}</figcaption></figure>)}</div>
        </section>
      )}
    </div>
  );
}
