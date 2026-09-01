import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/lib/catalog";

export const Route = createFileRoute("/ativos")({
  head: () => ({
    meta: [
      { title: "Ativos & Tecnologia — NUVE Advanced Skin Care" },
      {
        name: "description",
        content:
          "PDRN, GHK-Cu, niacinamida e peptídeos: entenda os ativos por trás dos séruns NUVE Advanced Skin Care.",
      },
      { property: "og:title", content: "Ativos & Tecnologia — NUVE" },
      { property: "og:description", content: "A ciência por trás de cada fórmula NUVE." },
    ],
  }),
  component: Ativos,
});

function Ativos() {
  const { data: products } = useProducts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="eyebrow">Ativos & tecnologia</p>
      <h1 className="mt-2 font-display text-4xl leading-tight text-ink md:text-5xl">
        A ciência por trás de cada gota
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-ash">
        Trabalhamos com ativos de comprovada performance, em concentrações que equilibram resultado e tolerância
        da pele.
      </p>

      <div className="mt-12 space-y-14">
        {(products ?? []).map((p) => (
          <section key={p.id}>
            <h2 className="font-display text-3xl text-ink">{p.name}</h2>
            <p className="mt-1 text-sm text-ash">{p.tagline}</p>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {p.actives.map((a) => (
                <div key={a.name} className="border border-border bg-card p-5">
                  <h3 className="font-display text-xl text-ink">{a.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ash">{a.text}</p>
                </div>
              ))}
            </div>
            <Link
              to="/produto/$slug"
              params={{ slug: p.slug }}
              className="mt-5 inline-block border-b border-clay pb-1 text-[11px] uppercase tracking-[0.2em] text-clay"
            >
              Ver {p.name}
            </Link>
          </section>
        ))}
      </div>
    </div>
  );
}
