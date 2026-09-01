import { Link } from "@tanstack/react-router";
import { brl, installments } from "@/lib/format";
import { coverOf, priceOf, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const cover = coverOf(product);
  const price = priceOf(product);

  return (
    <Link
      to="/produto/$slug"
      params={{ slug: product.slug }}
      className="group flex min-w-0 flex-col border border-border/70 bg-card transition-shadow hover:shadow-[0_18px_50px_-30px_rgba(60,30,20,0.5)]"
    >
      <div className="flex min-h-[360px] items-center justify-center overflow-hidden bg-cream p-3 sm:min-h-[420px] sm:p-4 lg:min-h-[460px]">
        {cover && (
          <img
            key={cover.url}
            src={cover.url}
            alt={cover.alt ?? product.name}
            loading="lazy"
            decoding="async"
            className="block max-h-[440px] max-w-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight text-ink">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ash">{product.tagline}</p>
        <div className="mt-4 flex-1" />
        <p className="text-base font-medium text-ink">{brl(price)}</p>
        <p className="text-[11px] text-ash">{installments(price)}</p>
        <span className="mt-4 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.18em] text-clay">
          Ver produto
        </span>
      </div>
    </Link>
  );
}
