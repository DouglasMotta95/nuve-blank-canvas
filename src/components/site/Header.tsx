import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSetting } from "@/lib/catalog";

const NAV = [
  { to: "/loja", label: "Loja" },
  { to: "/kits", label: "Kits" },
  { to: "/ativos", label: "Ativos & Tecnologia" },
  { to: "/sobre", label: "A Marca" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
] as const;

type SiteIdentity = { announcement?: string };

export function Header() {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const { data: siteIdentity } = useSetting<SiteIdentity>("site_identity");
  const announcement = siteIdentity?.announcement?.trim() || "Leve 2 ou mais e ganhe 10% OFF automático";

  return (
    <>
      <div className="bg-ink px-3 py-2 text-center text-[9px] uppercase tracking-[0.16em] text-ivory sm:px-4 sm:text-[10px] sm:tracking-[0.24em]">
        {announcement}
      </div>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between px-3 sm:px-5 xl:px-8">
          <button type="button" aria-label="Abrir menu" onClick={() => setOpen(true)} className="rounded-sm p-2 text-ink xl:hidden">
            <Menu className="size-5" />
          </button>

          <Link to="/" className="flex min-w-0 flex-col items-center leading-none xl:items-start">
            <span className="font-display text-lg tracking-[0.24em] text-ink sm:text-xl sm:tracking-[0.3em]">NUVE</span>
            <span className="mt-1 whitespace-nowrap text-[8px] tracking-[0.18em] text-clay sm:text-[9px] sm:tracking-[0.24em]">ADVANCE SKINCARE</span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="whitespace-nowrap text-[10px] uppercase tracking-[0.14em] text-ash transition-colors hover:text-ink 2xl:text-[11px] 2xl:tracking-[0.18em]" activeProps={{ className: "text-ink" }}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0 sm:gap-1">
            <Link to="/conta" aria-label="Minha conta" className="p-2 text-ink"><User className="size-5" /></Link>
            <Link to="/carrinho" aria-label="Carrinho" className="relative p-2 text-ink">
              <ShoppingBag className="size-5" />
              {cart.count > 0 && <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-clay text-[9px] font-medium text-ivory">{cart.count}</span>}
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/45 xl:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-[86%] max-w-sm overflow-y-auto bg-ivory p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex flex-col leading-none">
                <span className="font-display text-lg tracking-[0.3em]">NUVE</span>
                <span className="mt-1 text-[9px] tracking-[0.2em] text-clay">ADVANCE SKINCARE</span>
              </div>
              <button type="button" aria-label="Fechar menu" onClick={() => setOpen(false)} className="p-2"><X className="size-5" /></button>
            </div>
            <nav className="flex flex-col gap-5">
              {NAV.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm uppercase tracking-[0.16em] text-ink">{n.label}</Link>)}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
