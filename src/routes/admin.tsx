import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useIsAdmin, useSession } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel — NUVE Advanced Skin Care" },
      { name: "description", content: "Painel administrativo da loja NUVE Advanced Skin Care." },
      { property: "og:title", content: "Painel — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Gestão de produtos, pedidos e cupons." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

const LINKS = [
  { to: "/admin", label: "Visão geral", exact: true },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/produtos", label: "Produtos" },
  { to: "/admin/estoque", label: "Estoque" },
  { to: "/admin/cupons", label: "Cupons" },
  { to: "/admin/banners", label: "Banners" },
  { to: "/admin/configuracoes", label: "Configurações" },
] as const;


function AdminLayout() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin(user);

  if (loading || isAdmin === null) return <div className="m-8 h-40 animate-pulse bg-cream" />;

  if (!user || !isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Acesso restrito</h1>
        <p className="mt-3 text-sm text-ash">
          Faça login com uma conta administradora para acessar o painel.
        </p>
        <Link to="/conta" className="mt-6 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
          Ir para login
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <Link to="/" className="font-display text-lg tracking-[0.28em] text-ink">
            NUVE
          </Link>
          <nav className="flex flex-wrap gap-4">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: "exact" in l ? l.exact : false }}
                activeProps={{ className: "text-ink border-clay" }}
                className="border-b border-transparent pb-0.5 text-[11px] uppercase tracking-[0.16em] text-ash"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
