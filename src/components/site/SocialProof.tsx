import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRouterState } from "@tanstack/react-router";
import { recentPurchases, type SocialProofItem } from "@/lib/social-proof.functions";
import { useSetting } from "@/lib/catalog";

export const SOCIAL_PROOF_DEFAULT = {
  enabled: true,
  template: "{nome} de {cidade} acabou de comprar",
  subtitle: "{produto} · {tempo}",
  style: "claro" as "claro" | "escuro" | "blush" | "minimal",
  position: "bottom-left" as "bottom-left" | "bottom-right",
  interval: 12,
  duration: 6.5,
};

export type SocialProofSetting = typeof SOCIAL_PROOF_DEFAULT;

export function ago(minutes: number) {
  if (minutes < 60) return `há ${minutes} min`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}

export function renderTemplate(
  tpl: string,
  item: { name: string; city: string; product: string; minutesAgo: number },
) {
  return (tpl ?? "")
    .replace(/\{nome\}/g, item.name)
    .replace(/\{cidade\}/g, item.city)
    .replace(/\{produto\}/g, item.product)
    .replace(/\{tempo\}/g, ago(item.minutesAgo));
}

export const SOCIAL_PROOF_STYLES: Record<
  SocialProofSetting["style"],
  { card: string; title: string; meta: string; dot: string; close: string }
> = {
  claro: {
    card: "border border-border bg-card/95 shadow-lg backdrop-blur",
    title: "text-sm text-ink",
    meta: "text-[11px] uppercase tracking-[0.14em] text-ash",
    dot: "bg-clay",
    close: "text-ash hover:text-ink",
  },
  escuro: {
    card: "border border-ink/30 bg-ink/95 shadow-xl backdrop-blur",
    title: "text-sm text-ivory",
    meta: "text-[11px] uppercase tracking-[0.14em] text-ivory/70",
    dot: "bg-blush",
    close: "text-ivory/70 hover:text-ivory",
  },
  blush: {
    card: "border border-clay/40 bg-blush/95 shadow-lg backdrop-blur",
    title: "text-sm text-ink",
    meta: "text-[11px] uppercase tracking-[0.14em] text-clay",
    dot: "bg-clay",
    close: "text-clay hover:text-ink",
  },
  minimal: {
    card: "border border-border/60 bg-ivory",
    title: "text-sm text-ink",
    meta: "text-[11px] text-ash",
    dot: "bg-ink/40",
    close: "text-ash hover:text-ink",
  },
};

export function SocialProof() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fetchRecent = useServerFn(recentPurchases);
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/checkout");
  const { data: setting } = useSetting<Partial<SocialProofSetting>>("social_proof");
  const cfg = { ...SOCIAL_PROOF_DEFAULT, ...(setting ?? {}) };

  const { data } = useQuery({
    queryKey: ["social-proof"],
    queryFn: () => fetchRecent(),
    enabled: !hidden,
    staleTime: 1000 * 60 * 5,
  });

  const items: SocialProofItem[] = data?.enabled ? data.items : [];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const showMs = Math.max(2, Number(cfg.duration) || 6.5) * 1000;
  const gapMs = Math.max(4, Number(cfg.interval) || 12) * 1000;

  useEffect(() => {
    if (hidden || dismissed || items.length === 0 || cfg.enabled === false) return;
    let i = 0;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      setIndex(i % items.length);
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        i += 1;
        showTimer = setTimeout(cycle, gapMs);
      }, showMs);
    };

    showTimer = setTimeout(cycle, 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [hidden, dismissed, items.length, cfg.enabled, showMs, gapMs]);

  if (hidden || dismissed || items.length === 0 || cfg.enabled === false) return null;
  const item = items[index];
  if (!item) return null;

  const st = SOCIAL_PROOF_STYLES[cfg.style] ?? SOCIAL_PROOF_STYLES.claro;
  const side = cfg.position === "bottom-right" ? "right-4 bottom-20 sm:bottom-24" : "left-4 bottom-4";

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed z-50 max-w-[19rem] transition-all duration-500 ${side} ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3 ${st.card}`}>
        <span className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
        <div className="text-left">
          <p className={st.title}>{renderTemplate(cfg.template, item)}</p>
          {cfg.subtitle?.trim() && <p className={`mt-0.5 ${st.meta}`}>{renderTemplate(cfg.subtitle, item)}</p>}
        </div>
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={() => setDismissed(true)}
          className={`ml-1 transition-colors ${st.close}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}
