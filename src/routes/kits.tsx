import { createFileRoute, Link } from "@tanstack/react-router";
import { useKits, useProducts } from "@/lib/catalog";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { coverOf, priceOf } from "@/lib/catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Kits e combos — NUVE Advance Skincare" },
      { name: "description", content: "Monte seu ritual com 2 ou mais séruns NUVE e receba o desconto automático vigente." },
      { property: "og:title", content: "Kits NUVE Advance Skincare" },
      { property: "og:description", content: "Combine séruns NUVE em kits administráveis pelo painel." },
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
      const product = list.find((item) => item.slug === slug);
      if (!product) continue;
      cart.add(
        {
          product_id: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          unit_price_cents: priceOf(product),
          image: coverOf(product)?.url ?? null,
        },
        1,
      );
      added++;
    }
    if (added > 0) toast.success("Kit adicionado à sacola. O desconto vigente será aplicado automaticamente quando elegível.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Kits</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Combine seus séruns NUVE</h1>
      <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ash">Monte seu ritual com os kits ativos cadastrados no painel. A promoção vigente é aplicada no carrinho quando elegível.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {(kits ?? []).map((kit: any) => {
          const slugs: string[] = Array.isArray(kit.product_slugs) ? kit.product_slugs : [];
          const total = slugs.reduce((sum, slug) => {
            const product = (products ?? []).find((item) => item.slug === slug);
            return sum + (product ? priceOf(product) : 0);
          }, 0);
          const percent = Number(kit.percent_off ?? 10);
          const displayTotal = slugs.length >= 2 ? Math.round(total * (1 - Math.max(0, Math.min(percent, 100)) / 100)) : total;
          return (
            <article key={kit.id} className="flex flex-col overflow-hidden border border-border bg-card">
              {kit.image && <img src={kit.image} alt={kit.name} loading="lazy" className="max-h-[420px] w-full bg-cream object-contain" />}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-2xl text-ink">{kit.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ash">{kit.description}</p>
                <ul className="mt-4 space-y-1 text-sm text-ash">
                  {slugs.map((slug) => {
                    const product = (products ?? []).find((item) => item.slug === slug);
                    return <li key={slug} className="flex gap-2"><span className="text-clay">—</span>{product?.name ?? slug}</li>;
                  })}
                </ul>
                <div className="mt-5">
                  {displayTotal < total && <p className="text-sm text-ash line-through">{brl(total)}</p>}
                  <p className="font-display text-2xl text-ink">{brl(displayTotal)}</p>
                  {percent > 0 && <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-clay">{percent}% OFF no kit cadastrado</p>}
                </div>
                <button type="button" onClick={() => addKit(slugs)} className="mt-5 bg-ink py-3.5 text-[11px] uppercase tracking-[0.22em] text-ivory">Adicionar kit</button>
              </div>
            </article>
          );
        })}
      </div>

      <Link to="/loja" className="mt-10 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.2em] text-clay">Ver produtos individuais</Link>
    </div>
  );
}
