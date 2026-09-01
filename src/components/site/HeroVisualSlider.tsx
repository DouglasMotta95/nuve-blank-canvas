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

  return (
    <div
      className="relative w-full overflow-hidden bg-cream"
      aria-roledescription="carrossel"
      aria-label="Campanhas NUVE"
    >
      <div className="relative h-[clamp(340px,62vw,760px)] w-full sm:h-[clamp(420px,58vw,780px)] xl:h-[min(76vh,820px)]">
        {usable.map((slide, index) => (
          <picture
            key={slide.id}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-out ${
              index === active ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            aria-hidden={index !== active}
          >
            {slide.image_mobile && <source media="(max-width: 639px)" srcSet={slide.image_mobile} />}
            <img
              src={slide.image_desktop}
              alt={slide.title ? `${slide.title} — NUVE Advance Skincare` : "NUVE Advance Skincare"}
              className="block h-full w-full object-contain object-center"
              width={1920}
              height={1080}
              sizes="100vw"
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </picture>
        ))}
      </div>

      {usable.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ivory/78 px-3 py-2 backdrop-blur-sm">
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
