import { useState } from "react";
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
          content: `Sérum ${name} da NUVE Advanced Skin Care por R$ 149,90. Tecnologia japonesa e 10% OFF levando 2 ou mais.`,
        },
        { property: "og:title", content: `${name} — NUVE Advanced Skin Care` },
        { property: "og:description", content: "Sérum de alta performance com tecnologia japonesa." },
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
  const images = product.product_images;
  const beforeAfter = images.filter((i) => i.is_before_after);
  const others = (all ?? []).filter((p) => p.id !== product.id);

  return (
    <div className="nuve-reveal">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden bg-cream">
            {images[active] && (
              <img
                src={images[active]!.url}
                alt={images[active]!.alt ?? product.name}
                className="size-full object-contain p-6"
                width={1024}
                height={1024}
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ver imagem ${i + 1}`}
                  className={`aspect-square overflow-hidden bg-cream ${i === active ? "outline outline-1 outline-clay" : ""}`}
                >
                  <img src={img.url} alt={img.alt ?? product.name} loading="lazy" className="size-full object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow">{product.best_for ?? "NUVE Advanced"}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ash">{product.tagline}</p>

          <div className="mt-6">
            <p className="font-display text-3xl text-ink">{brl(price)}</p>
            <p className="text-[12px] text-ash">{installments(price)} · Pix com aprovação imediata</p>
          </div>

          <div className="mt-6">
            <AddToCart product={product} />
          </div>

          {product.benefits.length > 0 && (
            <ul className="mt-8 space-y-2 border-t border-border pt-6">
              {product.benefits.map((b) => (
                <li key={b} className="flex gap-3 text-sm text-ash">
                  <span className="text-clay">—</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-8">
        {beforeAfter.length > 0 && (
          <section>
            <p className="eyebrow">Antes e depois</p>
            <h2 className="mt-2 font-display text-3xl text-ink">Resultados reais com {product.name}</h2>
            <div className={`mt-5 grid gap-6 ${beforeAfter.length > 1 ? "md:grid-cols-2" : ""}`}>
              {beforeAfter.map((img) => (
                <figure key={img.id} className="overflow-hidden border border-border bg-cream">
                  <img
                    src={img.url}
                    alt={img.alt ?? `Antes e depois com ${product.name}`}
                    loading="lazy"
                    className="w-full object-contain"
                  />
                </figure>
              ))}
            </div>
            <p className="mt-3 text-[12px] text-ash">
              Imagens ilustrativas. Resultados variam conforme o tipo de pele e a constância do uso.
            </p>
          </section>
        )}

        {product.description && (
          <section>
            <p className="eyebrow">Sobre o produto</p>
            <p className="mt-3 max-w-[70ch] whitespace-pre-line text-[15px] leading-relaxed text-ash">
              {product.description}
            </p>
          </section>
        )}

        {product.actives.length > 0 && (
          <section>
            <p className="eyebrow">Ativos</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {product.actives.map((a) => (
                <div key={a.name} className="border border-border bg-card p-5">
                  <h3 className="font-display text-xl text-ink">{a.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ash">{a.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {product.how_to_use.length > 0 && (
          <section>
            <p className="eyebrow">Como usar</p>
            <ol className="mt-4 space-y-3">
              {product.how_to_use.map((step, i) => (
                <li key={step} className="flex gap-4 text-sm text-ash">
                  <span className="text-clay">0{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            {product.routine && <p className="mt-4 text-sm text-ash">{product.routine}</p>}
          </section>
        )}

        {(reviews?.length ?? 0) > 0 && (
          <section>
            <p className="eyebrow">Avaliações</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {(reviews ?? []).map((r: any) => (
                <figure key={r.id} className="border border-border bg-card p-5">
                  <div className="text-clay">{"★".repeat(r.rating)}</div>
                  <blockquote className="mt-2 text-sm leading-relaxed text-ash">"{r.comment}"</blockquote>
                  <figcaption className="mt-3 text-[11px] uppercase tracking-[0.16em] text-ink">{r.author_name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section>
            <p className="eyebrow">Combine e ganhe 10%</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
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
