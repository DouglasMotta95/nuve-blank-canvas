import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProduct, useProducts, useReviews, priceOf } from "@/lib/catalog";
import { brl, installments } from "@/lib/format";
import { AddToCart } from "@/components/site/AddToCart";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((s) => s.toUpperCase())
      .join(" ");
    return {
      meta: [
        { title: `${name} — NUVE Advanced Skin Care` },
        {
          name: "description",
          content: `Conheça o sérum ${name} da NUVE Advanced Skin Care. 10% OFF levando 2 ou mais unidades elegíveis.`,
        },
        { property: "og:title", content: `${name} — NUVE Advanced Skin Care` },
        { property: "og:description", content: "Skincare sofisticado com ativos selecionados para a vida real." },
      ],
    };
  },
  component: ProdutoPage,
});

function ProdutoPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: all } = useProducts();
  const { data: reviews } = useReviews(product?.id);
  const [active, setActive] = useState(0);

  if (isLoading) return <div className="mx-auto h-[60vh] max-w-6xl animate-pulse bg-cream" />;
  if (!product)
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Produto não encontrado</h1>
        <Link to="/loja" className="mt-4 inline-block border-b border-clay text-[11px] uppercase tracking-[0.2em] text-clay">
          Ver a loja
        </Link>
      </div>
    );

  const price = priceOf(product);
  const beforeAfter = product.product_images.filter((i) => i.is_before_after);
  const galleryImages = product.product_images.filter((i) => !i.is_before_after).slice(0, 4);
  const others = (all ?? []).filter((p) => p.id !== product.id);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  const activeImage = galleryImages[active] ?? galleryImages[0];

  return (
    <div className="nuve-reveal">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:py-14">
        <div>
          <div className="aspect-square overflow-hidden border border-border/60 bg-cream">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={activeImage.alt ?? product.name}
                className="size-full object-contain p-4 sm:p-6"
                width={1024}
                height={1024}
              />
            ) : (
              <div className="grid size-full place-items-center px-6 text-center text-sm text-ash">
                Imagem do produto em atualização.
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3" aria-label={`Galeria de ${product.name}`}>
              {galleryImages.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver foto ${i + 1} de ${product.name}`}
                  aria-current={i === active ? "true" : undefined}
                  className={`aspect-square overflow-hidden border bg-cream transition-colors ${
                    i === active ? "border-clay" : "border-border/60 hover:border-clay/60"
                  }`}
                >
                  <img src={img.url} alt="" loading="lazy" className="size-full object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow">{product.best_for ?? "NUVE Advanced"}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink md:text-5xl">{product.name}</h1>
          <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-ash">{product.tagline}</p>

          <div className="mt-6 border-y border-border py-5">
            <p className="font-display text-3xl text-ink">{brl(price)}</p>
            <p className="mt-1 text-[12px] text-ash">{installments(price)}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-clay">10% OFF levando 2 ou mais unidades elegíveis</p>
          </div>

          <div className="mt-6">
            <AddToCart product={product} />
          </div>

          {product.benefits.length > 0 && (
            <ul className="mt-8 space-y-2 border-t border-border pt-6">
              {product.benefits.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed text-ash">
                  <span className="text-clay">—</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-4 pb-14">
        {product.description && (
          <section className="border-t border-border pt-10">
            <p className="eyebrow">Sobre o produto</p>
            <p className="mt-3 max-w-[72ch] whitespace-pre-line text-[15px] leading-relaxed text-ash">
              {product.description}
            </p>
          </section>
        )}

        {product.actives.length > 0 && (
          <section>
            <p className="eyebrow">Ativos selecionados</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Por dentro da fórmula</h2>
            <div className="mt-5 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
              {product.actives.map((a) => (
                <div key={a.name} className="bg-card p-6">
                  <h3 className="font-display text-xl text-ink">{a.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ash">{a.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {product.how_to_use.length > 0 && (
          <section className="bg-blush/25 px-5 py-8 sm:px-8">
            <p className="eyebrow">Como usar</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Um ritual simples, todos os dias</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {product.how_to_use.map((step, i) => (
                <li key={step} className="border-t border-clay/40 pt-3 text-sm leading-relaxed text-ash">
                  <span className="mr-3 text-clay">0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            {product.routine && <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-ash">{product.routine}</p>}
          </section>
        )}

        {beforeAfter.length > 0 && (
          <section>
            <p className="eyebrow">Comparativo visual</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Experiência de uso</h2>
            <div className={`mt-5 grid gap-6 ${beforeAfter.length > 1 ? "md:grid-cols-2" : ""}`}>
              {beforeAfter.map((img) => (
                <figure key={img.id} className="overflow-hidden border border-border bg-cream">
                  <img
                    src={img.url}
                    alt={img.alt ?? `Comparativo visual de ${product.name}`}
                    loading="lazy"
                    className="w-full object-contain"
                  />
                </figure>
              ))}
            </div>
            <p className="mt-3 max-w-[70ch] text-[12px] leading-relaxed text-ash">
              Imagens de referência visual. A experiência e a aparência da pele podem variar de pessoa para pessoa.
            </p>
          </section>
        )}

        {(reviews?.length ?? 0) > 0 && (
          <section>
            <p className="eyebrow">Avaliações</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {(reviews ?? []).map((r: any) => (
                <figure key={r.id} className="border border-border bg-card p-5">
                  <div className="text-clay">{"★".repeat(r.rating)}</div>
                  <blockquote className="mt-2 text-sm leading-relaxed text-ash">“{r.comment}”</blockquote>
                  <figcaption className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink">{r.author_name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section className="border-t border-border pt-10">
            <p className="eyebrow">Complete seu ritual</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Combine dois e ganhe 10% OFF</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {others.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
