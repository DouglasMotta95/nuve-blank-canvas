import { useEffect, useRef, useState } from "react";

export type Slide = { url: string; alt: string };

export function AutoCarousel({ slides, interval = 4500 }: { slides: Slide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, slides.length, interval]);

  return (
    <div
      className="relative overflow-hidden bg-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carrossel"
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={s.url} className="w-full shrink-0">
            <img
              src={s.url}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-[4/5] w-full object-cover sm:aspect-[16/9]"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.url}
            type="button"
            aria-label={`Ir para a foto ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-ink" : "w-1.5 bg-ink/30 hover:bg-ink/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
