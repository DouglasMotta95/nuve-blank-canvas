import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart";

const NAV = [
  { to: "/loja", label: "Loja" },
  { to: "/kits", label: "Kits" },
  { to: "/ativos", label: "Ativos & Tecnologia" },
  { to: "/sobre", label: "A Marca" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const cart = useCart();

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[10px] uppercase tracking-[0.24em] text-ivory">
        Leve 2 ou mais e ganhe 10% OFF automático
      </div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-ivory/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen(true)}
            className="p-2 md:hidden"
          >
            <Menu className="size-5" />
          </button>

          <Link to="/" className="flex flex-col items-center leading-none md:items-start">
            <span className="font-display text-xl tracking-[0.3em] text-ink">NUVE</span>
            <span className="text-[8px] tracking-[0.34em] text-clay">ADVANCED SKIN CARE</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-[11px] uppercase tracking-[0.18em] text-ash transition-colors hover:text-ink"
                activeProps={{ className: "text-ink" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link to="/conta" aria-label="Minha conta" className="p-2 text-ink">
              <User className="size-5" />
            </Link>
            <Link to="/carrinho" aria-label="Carrinho" className="relative p-2 text-ink">
              <ShoppingBag className="size-5" />
              {cart.count > 0 && (
                <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-clay text-[9px] font-medium text-ivory">
                  {cart.count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="h-full w-[82%] max-w-xs bg-ivory p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg tracking-[0.3em]">NUVE</span>
              <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="text-sm uppercase tracking-[0.18em] text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
