import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = { url: string; alt: string };

export function AutoCarousel({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(!!entry?.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (paused || reduced || !inView || slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(id);
  }, [paused, reduced, inView, slides.length, interval]);

  if (slides.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-cream"
      role="group"
      aria-roledescription="carrossel"
      aria-label="Fotos da linha NUVE"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        if (start !== null && end !== null && Math.abs(end - start) > 40) go(index + (end < start ? 1 : -1));
        touchX.current = null;
        setPaused(false);
      }}
    >
      <div
        className="flex will-change-transform"
        style={{
          transform: `translate3d(-${index * 100}%, 0, 0)`,
          transition: reduced ? "none" : "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {slides.map((s, i) => {
          const near = Math.abs(i - index) <= 1 || (index === 0 && i === slides.length - 1);
          return (
            <div key={s.url} className="w-full shrink-0" aria-hidden={i !== index}>
              <div className="flex min-h-[300px] w-full items-center justify-center bg-cream p-2 sm:min-h-[420px] sm:p-4 lg:min-h-[540px]">
                {near ? (
                  <img
                    src={s.url}
                    alt={s.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding="async"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1024px"
                    className="block max-h-[72vh] max-w-full object-contain object-center"
                  />
                ) : (
                  <div className="min-h-[300px] w-full sm:min-h-[420px] lg:min-h-[540px]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2 sm:bottom-4">
        {slides.map((s, i) => (
          <button
            key={s.url}
            type="button"
            aria-label={`Ir para a foto ${i + 1} de ${slides.length}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/30 hover:bg-ink/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
