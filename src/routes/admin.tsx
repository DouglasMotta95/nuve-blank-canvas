import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useIsAdmin, useSession } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel — NUVE Advance Skincare" },
      { name: "description", content: "Painel administrativo da loja NUVE Advance Skincare." },
      { property: "og:title", content: "Painel — NUVE Advance Skincare" },
      { property: "og:description", content: "Gestão de produtos, conteúdo, pedidos e promoções." },
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
  { to: "/admin/banners", label: "Conteúdo do site" },
  { to: "/admin/cupons", label: "Cupons" },
  { to: "/admin/configuracoes", label: "Configurações" },
  { to: "/admin/auditoria", label: "Auditoria" },
] as const;

function AdminLayout() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin(user);

  if (loading || isAdmin === null) return <div className="m-8 h-40 animate-pulse bg-cream" />;

  if (!user || !isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Acesso restrito</h1>
        <p className="mt-3 text-sm text-ash">Faça login com uma conta administradora para acessar o painel.</p>
        <Link to="/conta" className="mt-6 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
          Ir para login
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="shrink-0 font-display text-lg tracking-[0.28em] text-ink">
            NUVE
          </Link>
          <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-2">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: "exact" in link ? link.exact : false }}
                activeProps={{ className: "text-ink border-clay" }}
                className="border-b border-transparent pb-0.5 text-[11px] uppercase tracking-[0.13em] text-ash"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
