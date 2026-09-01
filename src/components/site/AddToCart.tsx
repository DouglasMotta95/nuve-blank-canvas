import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { coverOf, priceOf, type Product } from "@/lib/catalog";

export function AddToCart({ product }: { product: Product }) {
  const cart = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;

  const item = {
    product_id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    unit_price_cents: priceOf(product),
    image: coverOf(product)?.url ?? null,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-input">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            className="px-3 py-2 text-ink"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            className="px-3 py-2 text-ink"
            onClick={() => setQty((q) => Math.min(10, q + 1))}
          >
            +
          </button>
        </div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-clay">
          {soldOut ? "Esgotado" : "Pronta entrega"}
        </p>
      </div>

      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          cart.add(item, qty);
          toast.success("Produto adicionado à sacola.");
        }}
        className="w-full bg-ink py-4 text-[11px] uppercase tracking-[0.22em] text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Adicionar à sacola
      </button>
      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          cart.add(item, qty);
          navigate({ to: "/checkout" });
        }}
        className="w-full border border-ink py-4 text-[11px] uppercase tracking-[0.22em] text-ink transition-colors hover:bg-ink hover:text-ivory disabled:opacity-40"
      >
        Comprar agora
      </button>
      <p className="text-center text-[11px] text-ash">
        Levando 2 ou mais unidades, 10% OFF aplicados automaticamente.
      </p>
    </div>
  );
}
