import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Sacola — NUVE Advanced Skin Care" },
      { name: "description", content: "Revise os itens da sua sacola NUVE e finalize a compra com segurança." },
      { property: "og:title", content: "Sacola — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Revise seus séruns NUVE e finalize a compra." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Carrinho,
});

function Carrinho() {
  const cart = useCart();

  if (cart.items.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-ink">Sua sacola está vazia</h1>
        <p className="mt-3 text-sm text-ash">Descubra os séruns NUVE e comece o seu ritual.</p>
        <Link to="/loja" className="mt-8 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
          Ir para a loja
        </Link>
      </div>
    );

  const t = cart.totals;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <h1 className="font-display text-4xl text-ink">Sua sacola</h1>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {cart.items.map((i) => (
            <li key={i.product_id} className="flex gap-4 py-5">
              <div className="size-24 shrink-0 bg-cream">
                {i.image && <img src={i.image} alt={i.name} className="size-full object-contain p-2" />}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg text-ink">{i.name}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-ash">{i.sku}</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center border border-input">
                    <button type="button" aria-label="Diminuir" className="px-3 py-1" onClick={() => cart.setQuantity(i.product_id, i.quantity - 1)}>
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button type="button" aria-label="Aumentar" className="px-3 py-1" onClick={() => cart.setQuantity(i.product_id, i.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" aria-label="Remover" onClick={() => cart.remove(i.product_id)} className="text-ash hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-ink">{brl(i.unit_price_cents * i.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit border border-border bg-card p-6">
        <h2 className="font-display text-2xl text-ink">Resumo</h2>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between text-ash">
            <dt>Subtotal</dt>
            <dd>{brl(t.subtotal)}</dd>
          </div>
          {t.promoDiscount > 0 && (
            <div className="flex justify-between text-clay">
              <dt>Desconto 10% (2+ unidades)</dt>
              <dd>− {brl(t.promoDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-base text-ink">
            <dt>Total</dt>
            <dd>{brl(t.total)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[11px] text-ash">Frete e cupom calculados no checkout.</p>
        <Link to="/checkout" className="mt-6 block bg-ink py-4 text-center text-[11px] uppercase tracking-[0.22em] text-ivory">
          Finalizar compra
        </Link>
        <Link to="/loja" className="mt-3 block text-center text-[11px] uppercase tracking-[0.18em] text-clay">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}
