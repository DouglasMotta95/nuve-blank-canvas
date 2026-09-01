import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja — NUVE Advance Skincare" },
      {
        name: "description",
        content: "Compre os séruns NUVE: 5 EM 1, GHK-Cu e PDRN por R$ 149,90 cada. 10% OFF a partir de 2 unidades.",
      },
      { property: "og:title", content: "Loja NUVE Advance Skincare" },
      { property: "og:description", content: "Séruns de alta performance com tecnologia japonesa." },
    ],
  }),
  component: Loja,
});

function Loja() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-10 nuve-reveal sm:px-6 sm:py-12 xl:px-8">
      <p className="eyebrow">Loja</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">Todos os produtos</h1>
      <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-ash sm:text-[15px]">
        Cada sérum tem 30ml e rende cerca de 60 dias de uso. Levando 2 ou mais unidades, o desconto de 10%
        entra automaticamente na sacola.
      </p>

      <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {isLoading
          ? [0, 1, 2].map((i) => <div key={i} className="min-h-[420px] animate-pulse bg-cream sm:min-h-[520px]" />)
          : (products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
