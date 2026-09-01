import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useIsAdmin, useSession } from "@/lib/auth";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/conta")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha conta — NUVE Advanced Skin Care" },
      { name: "description", content: "Acesse sua conta NUVE para acompanhar pedidos e dados de entrega." },
      { property: "og:title", content: "Minha conta — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Acompanhe seus pedidos NUVE." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Conta,
});

function Conta() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin(user);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, order_number, total_cents, status, payment_status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders(data ?? []));
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/conta` },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail se a confirmação estiver ativa.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível autenticar.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Não foi possível entrar com Google.");
      return;
    }
  }

  if (loading) return <div className="mx-auto h-[40vh] max-w-md animate-pulse bg-cream" />;

  if (!user)
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="eyebrow">Minha conta</p>
        <h1 className="mt-2 font-display text-4xl text-ink">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-ash">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-input bg-ivory px-3 py-2.5 text-sm outline-none focus:border-clay"
            />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-ash">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-input bg-ivory px-3 py-2.5 text-sm outline-none focus:border-clay"
            />
          </label>
          <button type="submit" disabled={busy} className="w-full bg-ink py-4 text-[11px] uppercase tracking-[0.22em] text-ivory disabled:opacity-50">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button type="button" onClick={google} className="mt-3 w-full border border-ink py-4 text-[11px] uppercase tracking-[0.22em] text-ink">
          Continuar com Google
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 w-full text-center text-[11px] uppercase tracking-[0.16em] text-clay"
        >
          {mode === "login" ? "Não tenho conta" : "Já tenho conta"}
        </button>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="eyebrow">Minha conta</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Olá!</h1>
      <p className="mt-2 text-sm text-ash">{user.email}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {isAdmin && (
          <Link to="/admin" className="border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ink">
            Painel administrativo
          </Link>
        )}
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="border border-input px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-ash"
        >
          Sair
        </button>
      </div>

      <h2 className="mt-12 font-display text-2xl text-ink">Meus pedidos</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-ash">Você ainda não tem pedidos.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between py-4 text-sm">
              <div>
                <Link to="/pedido/$id" params={{ id: o.id }} className="text-ink underline-offset-4 hover:underline">
                  {o.order_number}
                </Link>
                <p className="text-[11px] uppercase tracking-[0.14em] text-ash">{o.payment_status}</p>
              </div>
              <span className="text-ink">{brl(o.total_cents)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
