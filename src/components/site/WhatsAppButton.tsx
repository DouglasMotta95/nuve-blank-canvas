import { useRouterState } from "@tanstack/react-router";
import { useSetting } from "@/lib/catalog";

export const WHATSAPP_DEFAULT = {
  enabled: true,
  phone: "19991227755",
  message: "Olá! Gostaria de saber mais sobre os séruns NUVE Advanced.",
};

export type WhatsAppSetting = typeof WHATSAPP_DEFAULT;

export function whatsappHref(phone: string, message: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const full = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message || WHATSAPP_DEFAULT.message)}`;
}

function prettyPhone(phone: string) {
  const d = (phone ?? "").replace(/\D/g, "").replace(/^55/, "");
  if (d.length < 10) return "";
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

export function WhatsAppButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data } = useSetting<Partial<WhatsAppSetting>>("whatsapp");
  const cfg = { ...WHATSAPP_DEFAULT, ...(data ?? {}) };

  const hidden = pathname.startsWith("/admin");
  const href = whatsappHref(cfg.phone, cfg.message);
  if (hidden || !cfg.enabled || !href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Falar com a NUVE no WhatsApp ${prettyPhone(cfg.phone)}`}
      className="group fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_-16px_rgba(37,211,102,0.9)] transition-transform hover:scale-[1.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:bottom-6 sm:right-6"
    >
      <span className="relative flex h-7 w-7">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/40" aria-hidden="true" />
        <svg viewBox="0 0 24 24" aria-hidden="true" className="relative h-full w-full fill-current">
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35z" />
          <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.83 9.83 0 0 0 4.69 1.2h.01c5.43 0 9.85-4.42 9.85-9.86 0-2.63-1.03-5.1-2.89-6.96A9.78 9.78 0 0 0 12.04 2zm0 17.96h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.17.83.85-3.1-.2-.32a8.14 8.14 0 0 1-1.25-4.35c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.4a8.15 8.15 0 0 1 2.4 5.8c0 4.52-3.68 8.26-8.16 8.26z" />
        </svg>
      </span>
    </a>
  );
}

