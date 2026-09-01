import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRouterState } from "@tanstack/react-router";
import { recentPurchases, type SocialProofItem } from "@/lib/social-proof.functions";

function ago(minutes: number) {
  if (minutes < 60) return `há ${minutes} min`;
  const h = Math.round(minutes / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}

export function SocialProof() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const fetchRecent = useServerFn(recentPurchases);
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/checkout");

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

  useEffect(() => {
    if (hidden || dismissed || items.length === 0) return;
    let i = 0;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const cycle = () => {
      setIndex(i % items.length);
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        i += 1;
        showTimer = setTimeout(cycle, 12000);
      }, 6500);
    };

    showTimer = setTimeout(cycle, 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [hidden, dismissed, items.length]);

  if (hidden || dismissed || items.length === 0) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed bottom-4 left-4 z-50 max-w-[19rem] transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex items-start gap-3 border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
        <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-clay" />
        <div className="text-left">
          <p className="text-sm text-ink">
            <strong className="font-medium">{item.name}</strong> de {item.city} acabou de comprar
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-ash">
            {item.product} · {ago(item.minutesAgo)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={() => setDismissed(true)}
          className="ml-1 text-ash transition-colors hover:text-ink"
        >
          ×
        </button>
      </div>
    </div>
  );
}
