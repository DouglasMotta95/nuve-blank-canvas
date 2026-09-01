import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Settings } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/orders.functions";
import { useSetting } from "@/lib/catalog";

type SiteIdentity = {
  instagram?: string;
  tiktok?: string;
  email?: string;
};

const DEFAULTS = {
  instagram: "https://www.instagram.com/nuve_serum?igsi=MWF0eGxhdmp0MXloMg==",
  tiktok: "https://www.tiktok.com/@nuveadvanced",
  email: "nuveadvanced@gmail.com",
};

function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14.5 3c.3 1.7 1.3 3 2.8 3.9.9.5 1.8.7 2.7.8v3.1c-1.8 0-3.5-.6-4.9-1.7v6.2a6.5 6.5 0 1 1-5.6-6.4v3.2a3.4 3.4 0 1 0 2.4 3.2V3h3.3Z" />
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: siteIdentity } = useSetting<SiteIdentity>("site_identity");
  const instagram = siteIdentity?.instagram?.trim() || DEFAULTS.instagram;
  const tiktok = siteIdentity?.tiktok?.trim() || DEFAULTS.tiktok;
  const publicEmail = siteIdentity?.email?.trim() || DEFAULTS.email;

  return (
    <footer className="mt-16 border-t border-border bg-cream sm:mt-20 xl:mt-24">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-6 sm:py-12 xl:px-8 xl:py-14">
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10">
          <div>
            <p className="font-display text-xl tracking-[0.3em]">NUVE</p>
            <p className="mt-1 text-[8px] tracking-[0.24em] text-clay">ADVANCE SKINCARE</p>
            <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ash">Skincare de alta performance com tecnologia japonesa e ativos de última geração.</p>
            <div className="mt-4 flex flex-col items-start gap-2">
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Abrir Instagram da NUVE" className="inline-flex items-center gap-2 text-sm text-ash transition-colors hover:text-ink"><Instagram className="size-4" /> Instagram</a>
              <a href={tiktok} target="_blank" rel="noopener noreferrer" aria-label="Abrir TikTok da NUVE" className="inline-flex items-center gap-2 text-sm text-ash transition-colors hover:text-ink"><TikTokIcon className="size-4" /> TikTok</a>
            </div>
            <a href={`mailto:${publicEmail}`} className="mt-2 block break-all text-sm text-ash hover:text-ink">{publicEmail}</a>
          </div>

          <nav className="flex flex-col gap-2 text-sm text-ash">
            <span className="eyebrow mb-2">Institucional</span>
            <Link to="/sobre" className="hover:text-ink">A Marca</Link>
            <Link to="/ativos" className="hover:text-ink">Ativos & Tecnologia</Link>
            <Link to="/faq" className="hover:text-ink">Perguntas frequentes</Link>
            <Link to="/rastreio" className="hover:text-ink">Rastrear pedido</Link>
            <Link to="/contato" className="hover:text-ink">Contato</Link>
          </nav>

          <nav className="flex flex-col gap-2 text-sm text-ash">
            <span className="eyebrow mb-2">Políticas</span>
            <Link to="/politicas/$slug" params={{ slug: "privacidade" }} className="hover:text-ink">Privacidade</Link>
            <Link to="/politicas/$slug" params={{ slug: "trocas" }} className="hover:text-ink">Trocas e devoluções</Link>
            <Link to="/politicas/$slug" params={{ slug: "envio" }} className="hover:text-ink">Envio e prazos</Link>
            <Link to="/politicas/$slug" params={{ slug: "termos" }} className="hover:text-ink">Termos de uso</Link>
          </nav>

          <div>
            <span className="eyebrow">Newsletter</span>
            <p className="mt-2 text-sm text-ash">Rituais, lançamentos e cupons exclusivos.</p>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.includes("@")) return toast.error("Informe um e-mail válido.");
                setBusy(true);
                try {
                  await subscribeNewsletter({ data: { email: email.trim() } });
                  toast.success("Inscrição confirmada.");
                  setEmail("");
                } catch {
                  toast.error("Não foi possível inscrever agora.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" maxLength={160} className="min-w-0 flex-1 border border-input bg-ivory px-3 py-2 text-sm outline-none placeholder:text-ash/70" />
              <button type="submit" disabled={busy} className="min-h-10 bg-ink px-4 text-[11px] uppercase tracking-[0.18em] text-ivory disabled:opacity-50">Ok</button>
            </form>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-[11px] leading-relaxed text-ash xl:mt-12 xl:flex-row xl:items-center xl:justify-between">
          <span>© {new Date().getFullYear()} NUVE Advance Skincare. Todos os direitos reservados.</span>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span>Pagamentos processados por Mercado Pago · Pix, cartão e boleto</span>
            <Link to="/admin" aria-label="Acessar painel administrativo" className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.16em] text-ash/60 transition-colors hover:text-ink"><Settings className="size-3" /> Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
