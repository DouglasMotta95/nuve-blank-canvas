import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — NUVE Advanced Skin Care" },
      {
        name: "description",
        content: "Compre os séruns NUVE: 5 EM 1, GHK-Cu e PDRN por R$ 149,90 cada. 10% OFF a partir de 2 unidades.",
      },
      { property: "og:title", content: "Loja NUVE Advanced Skin Care" },
      { property: "og:description", content: "Séruns de alta performance com tecnologia japonesa." },
    ],
  }),
  component: Loja,
});

function Loja() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 nuve-reveal">
      <p className="eyebrow">Loja</p>
      <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Todos os produtos</h1>
      <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-ash">
        Cada sérum tem 30ml e rende cerca de 60 dias de uso. Levando 2 ou mais unidades, o desconto de 10%
        entra automaticamente na sacola.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? [0, 1, 2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse bg-cream" />)
          : (products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
