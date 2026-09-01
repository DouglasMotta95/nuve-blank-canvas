import { useEffect, useMemo, useState } from "react";

type HeroVisual = {
  id: string;
  image_desktop: string;
  image_mobile?: string | null;
  title?: string | null;
};

export function HeroVisualSlider({ slides }: { slides: HeroVisual[] }) {
  const usable = useMemo(() => slides.filter((slide) => Boolean(slide.image_desktop)), [slides]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (usable.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % usable.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [usable.length]);

  useEffect(() => {
    if (active >= usable.length) setActive(0);
  }, [active, usable.length]);

  if (usable.length === 0) return null;

  const current = usable[active] ?? usable[0];

  return (
    <div
      className="relative w-full overflow-hidden bg-cream"
      aria-roledescription="carrossel"
      aria-label="Campanhas NUVE"
    >
      <picture key={current.id} className="block w-full">
        {current.image_mobile && <source media="(max-width: 639px)" srcSet={current.image_mobile} />}
        <img
          src={current.image_desktop}
          alt={current.title ? `${current.title} — NUVE Advance Skincare` : "NUVE Advance Skincare"}
          className="block h-auto w-full object-contain object-center"
          width={1920}
          height={1080}
          sizes="100vw"
          fetchPriority={active === 0 ? "high" : "auto"}
          loading={active === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      </picture>

      {usable.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ivory/90 px-3 py-2 shadow-sm backdrop-blur-sm sm:bottom-4">
          {usable.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ir para imagem ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === active ? "w-6 bg-ink/80" : "w-1.5 bg-ink/25 hover:bg-ink/45"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
