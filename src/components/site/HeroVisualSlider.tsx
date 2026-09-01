import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const goTo = (index: number) => setActive((index + usable.length) % usable.length);

  return (
    <div className="relative mx-auto w-full max-w-[620px] overflow-hidden bg-blush/20" aria-roledescription="carrossel">
      <div className="relative aspect-[4/3] sm:aspect-[16/11]">
        {usable.map((slide, index) => (
          <picture
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${index === active ? "z-10 opacity-100" : "z-0 opacity-0"}`}
            aria-hidden={index !== active}
          >
            {slide.image_mobile && <source media="(max-width: 767px)" srcSet={slide.image_mobile} />}
            <img
              src={slide.image_desktop}
              alt={slide.title ? `${slide.title} — NUVE Advanced Skin Care` : "NUVE Advanced Skin Care"}
              className="size-full object-contain"
              width={1080}
              height={810}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </picture>
        ))}
      </div>

      {usable.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Imagem anterior"
            className="absolute left-3 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-ivory/90 text-ink shadow-sm transition hover:bg-ivory"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Próxima imagem"
            className="absolute right-3 top-1/2 z-20 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-ivory/90 text-ink shadow-sm transition hover:bg-ivory"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-ivory/80 px-2.5 py-2 backdrop-blur-sm">
            {usable.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir para imagem ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all ${index === active ? "w-5 bg-ink" : "w-1.5 bg-ink/30 hover:bg-ink/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
