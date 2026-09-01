import { createFileRoute } from "@tanstack/react-router";

import heroImage from "@/assets/nuve-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nuve Advanced — Calmbuilt Systems" },
      {
        name: "description",
        content:
          "Precision infrastructure for teams who move slowly on purpose. Quiet at the horizon, exact underneath.",
      },
      { property: "og:title", content: "Nuve Advanced — Calmbuilt Systems" },
      {
        property: "og:description",
        content: "Precision infrastructure for teams who move slowly on purpose.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink font-sans text-foam antialiased selection:bg-aqua/25 selection:text-foam">
      {/* Atmospheric background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% -15%, var(--shale) 0%, transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 125%, oklch(0.13 0.04 240) 0%, transparent 48%)",
          }}
        />
        <div className="absolute -left-[20%] top-[4%] size-[320px] animate-[nuve-drift_16s_var(--ease-out-expo)_infinite] rounded-full bg-cyan/25 blur-[120px] md:size-[420px]" />
        <div className="absolute -right-[24%] top-[46%] size-[300px] animate-[nuve-drift_20s_var(--ease-out-expo)_infinite_reverse] rounded-full bg-aqua/20 blur-[130px] md:size-[400px]" />
        <div className="absolute inset-x-0 top-0 h-px animate-[nuve-pulse_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-aqua/60 to-transparent" />
      </div>

      <header className="relative z-10 flex animate-[nuve-in_700ms_var(--ease-out-expo)_both] items-center justify-between px-6 pt-5">
        <div className="flex items-baseline gap-2">
          <span className="size-2 translate-y-[-1px] rounded-full bg-aqua shadow-[0_0_8px_2px_rgba(90,211,230,0.6)]" />
          <span className="text-[13px] font-semibold tracking-[0.14em]">NUVE</span>
        </div>
        <span className="text-[11px] tracking-[0.22em] text-mist">ADVANCED</span>
      </header>

      <main>
        <section className="relative z-10 mx-auto max-w-[24ch] px-6 pt-[72px] text-center md:max-w-[30ch] md:pt-28">
          <p
            className="animate-[nuve-in_700ms_var(--ease-out-expo)_both] text-[11px] font-medium uppercase tracking-[0.34em] text-aqua"
            style={{ animationDelay: "80ms" }}
          >
            Calmbuilt systems
          </p>
          <h1
            className="animate-[nuve-in_780ms_var(--ease-out-expo)_both] mt-4 text-[52px] font-bold leading-[0.92] tracking-tight text-balance md:text-[72px]"
            style={{ animationDelay: "160ms" }}
          >
            Nuve
            <br />
            Advanced
          </h1>
          <p
            className="animate-[nuve-in_780ms_var(--ease-out-expo)_both] mx-auto mt-5 max-w-[30ch] text-[15px] leading-relaxed text-mist text-pretty md:max-w-[36ch] md:text-[17px]"
            style={{ animationDelay: "280ms" }}
          >
            Precision infrastructure for teams who move slowly on purpose. Quiet at the horizon,
            exact underneath.
          </p>
        </section>

        <div
          className="animate-[nuve-in_820ms_var(--ease-out-expo)_both] relative z-10 mx-auto mt-9 max-w-[300px] px-6 md:max-w-[640px]"
          style={{ animationDelay: "400ms" }}
        >
          <div className="mx-auto w-full overflow-hidden rounded-[20px] outline outline-1 -outline-offset-1 outline-foam/10">
            <img
              src={heroImage}
              alt="Calm ocean horizon at deep blue dawn with a soft bioluminescent light line on the water"
              width={1024}
              height={640}
              className="w-full"
            />
          </div>
        </div>

        <section className="relative z-10 mx-auto max-w-[300px] px-6 pt-11 md:max-w-[640px]">
          <div
            className="animate-[nuve-in_720ms_var(--ease-out-expo)_both] mb-5 flex items-center gap-3"
            style={{ animationDelay: "520ms" }}
          >
            <span className="text-[10px] tracking-[0.22em] text-mist">CAPABILITIES</span>
            <span className="h-px flex-1 bg-foam/10" />
          </div>
          <ul className="divide-y divide-foam/8">
            <li
              className="animate-[nuve-in_720ms_var(--ease-out-expo)_both] group flex gap-4 py-4"
              style={{ animationDelay: "600ms" }}
            >
              <span className="w-6 shrink-0 pt-0.5 text-[11px] tracking-[0.1em] text-aqua">01</span>
              <div>
                <h3 className="text-[15px] font-semibold text-foam">Depth by design</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-mist">
                  Every layer surfaces only when it matters. No noise above the horizon.
                </p>
              </div>
            </li>
            <li
              className="animate-[nuve-in_720ms_var(--ease-out-expo)_both] group flex gap-4 py-4"
              style={{ animationDelay: "680ms" }}
            >
              <span className="w-6 shrink-0 pt-0.5 text-[11px] tracking-[0.1em] text-aqua">02</span>
              <div>
                <h3 className="text-[15px] font-semibold text-foam">Weightless control</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-mist">
                  Deploy, scale, and observe from one calm surface. Nothing to fight.
                </p>
              </div>
            </li>
            <li
              className="animate-[nuve-in_720ms_var(--ease-out-expo)_both] group flex gap-4 py-4"
              style={{ animationDelay: "760ms" }}
            >
              <span className="w-6 shrink-0 pt-0.5 text-[11px] tracking-[0.1em] text-aqua">03</span>
              <div>
                <h3 className="text-[15px] font-semibold text-foam">Lift when it counts</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-mist">
                  Quiet defaults, exact signals, and room to breathe under load.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <p
          className="animate-[nuve-in_720ms_var(--ease-out-expo)_both] relative z-10 mx-auto mt-10 max-w-[300px] px-6 text-center text-[12px] leading-relaxed text-mist/80 md:max-w-[640px]"
          style={{ animationDelay: "880ms" }}
        >
          Trusted by calm teams at Halcyon, Meridian, and Tidewell.
        </p>

        <section
          className="animate-[nuve-in_780ms_var(--ease-out-expo)_both] relative z-10 mx-auto max-w-[300px] px-6 pt-9 md:max-w-[420px]"
          style={{ animationDelay: "980ms" }}
        >
          <a
            href="#"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-aqua px-6 py-3.5 text-[15px] font-semibold text-ink ring-1 ring-aqua/40 ring-offset-2 ring-offset-ink transition-all duration-300 hover:bg-foam"
          >
            Request access
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </a>
        </section>
      </main>

      <footer
        className="animate-[nuve-in_720ms_var(--ease-out-expo)_both] relative z-10 mt-12 flex items-center justify-between border-t border-foam/8 px-6 py-6 text-[11px] tracking-[0.1em] text-mist/70"
        style={{ animationDelay: "1100ms" }}
      >
        <span>NUVE ADVANCED</span>
        <span>© 2025</span>
      </footer>
    </div>
  );
}
