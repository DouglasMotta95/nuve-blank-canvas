import { createFileRoute, Link } from "@tanstack/react-router";
import { useKits, useProducts } from "@/lib/catalog";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { coverOf, priceOf } from "@/lib/catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Kits e combos — NUVE Advanced Skin Care" },
      {
        name: "description",
        content: "Monte seu ritual com 2 ou 3 séruns NUVE e receba 10% OFF automático em toda a sacola.",
      },
      { property: "og:title", content: "Kits NUVE Advanced Skin Care" },
      { property: "og:description", content: "Combine séruns e economize 10% automaticamente." },
    ],
  }),
  component: Kits,
});

function Kits() {
  const { data: kits } = useKits();
  const { data: products } = useProducts();
  const cart = useCart();

  function addKit(slugs: string[]) {
    const list = products ?? [];
    let added = 0;
    for (const slug of slugs) {
      const p = list.find((x) => x.slug === slug);
      if (!p) continue;
      cart.add(
        {
          product_id: p.id,
          slug: p.slug,
          sku: p.sku,
          name: p.name,
          unit_price_cents: priceOf(p),
          image: coverOf(p)?.url ?? null,
        },
        1,
      );
      added++;
    }
    if (added > 0) toast.success("Kit adicionado à sacola com 10% OFF.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Kits</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Combine e economize 10%</h1>
      <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ash">
        O desconto de 10% é automático sempre que a sacola tiver 2 ou mais unidades — em qualquer combinação.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {(kits ?? []).map((k: any) => {
          const slugs: string[] = Array.isArray(k.product_slugs) ? k.product_slugs : [];
          const total = slugs.reduce((s, slug) => {
            const p = (products ?? []).find((x) => x.slug === slug);
            return s + (p ? priceOf(p) : 0);
          }, 0);
          const withDiscount = slugs.length >= 2 ? Math.round(total * 0.9) : total;
          return (
            <article key={k.id} className="flex flex-col border border-border bg-card p-6">
              <h2 className="font-display text-2xl text-ink">{k.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ash">{k.description}</p>
              <ul className="mt-4 space-y-1 text-sm text-ash">
                {slugs.map((slug) => {
                  const p = (products ?? []).find((x) => x.slug === slug);
                  return (
                    <li key={slug} className="flex gap-2">
                      <span className="text-clay">—</span>
                      {p?.name ?? slug}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-5">
                {withDiscount < total && <p className="text-sm text-ash line-through">{brl(total)}</p>}
                <p className="font-display text-2xl text-ink">{brl(withDiscount)}</p>
              </div>
              <button
                type="button"
                onClick={() => addKit(slugs)}
                className="mt-5 bg-ink py-3.5 text-[11px] uppercase tracking-[0.22em] text-ivory"
              >
                Adicionar kit
              </button>
            </article>
          );
        })}
      </div>

      <Link to="/loja" className="mt-10 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.2em] text-clay">
        Ver produtos individuais
      </Link>
    </div>
  );
}
