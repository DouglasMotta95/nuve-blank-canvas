import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/lib/cart";
import { brl, computeTotals } from "@/lib/format";
import { createOrder, validateCoupon } from "@/lib/orders.functions";
import { createMercadoPagoCheckout } from "@/lib/payments.functions";
import { useSession } from "@/lib/auth";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — NUVE Advanced Skin Care" },
      { name: "description", content: "Finalize seu pedido NUVE com pagamento seguro via Mercado Pago." },
      { property: "og:title", content: "Checkout — NUVE Advanced Skin Care" },
      { property: "og:description", content: "Pagamento seguro por Pix, cartão ou boleto." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const formSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  phone: z.string().trim().min(10, "Telefone inválido").max(30),
  cpf: z.string().trim().min(11, "CPF inválido").max(20),
  cep: z.string().trim().min(8, "CEP inválido").max(9),
  street: z.string().trim().min(2, "Informe a rua").max(160),
  number: z.string().trim().min(1, "Informe o número").max(20),
  complement: z.string().trim().max(80),
  district: z.string().trim().min(2, "Informe o bairro").max(80),
  city: z.string().trim().min(2, "Informe a cidade").max(80),
  state: z.string().trim().length(2, "UF com 2 letras"),
});

const EMPTY = {
  name: "", email: "", phone: "", cpf: "", cep: "", street: "",
  number: "", complement: "", district: "", city: "", state: "",
};

function Field({
  label, name, value, onChange, className = "", ...rest
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "name">) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.16em] text-ash">{label}</span>
      <input
        {...rest}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-input bg-ivory px-3 py-2.5 text-sm outline-none focus:border-clay"
      />
    </label>
  );
}

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const { user } = useSession();
  const [form, setForm] = useState({ ...EMPTY });
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; percent_off: number | null; amount_off_cents: number | null } | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const totals = computeTotals(cart.items, {
    couponPercent: applied?.percent_off,
    couponAmountCents: applied?.amount_off_cents,
  });

  if (cart.items.length === 0)
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Sua sacola está vazia</h1>
        <Link to="/loja" className="mt-6 inline-block bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.22em] text-ivory">
          Ver produtos
        </Link>
      </div>
    );

  async function applyCoupon() {
    const code = coupon.trim();
    if (!code) return;
    const res = await validateCoupon({ data: { code, subtotal_cents: totals.subtotal } });
    if (!res.valid) {
      setApplied(null);
      toast.error(res.error);
      return;
    }
    setApplied({ code: res.code, percent_off: res.percent_off, amount_off_cents: res.amount_off_cents });
    toast.success("Cupom aplicado.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revise os dados informados.");
      return;
    }
    setBusy(true);
    try {
      const order = await createOrder({
        data: {
          items: cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          coupon_code: applied?.code ?? null,
          user_id: user?.id ?? null,
          customer: {
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone,
            cpf: parsed.data.cpf,
          },
          shipping: {
            cep: parsed.data.cep,
            street: parsed.data.street,
            number: parsed.data.number,
            complement: parsed.data.complement,
            district: parsed.data.district,
            city: parsed.data.city,
            state: parsed.data.state.toUpperCase(),
          },
        },
      });

      const payment = await createMercadoPagoCheckout({ data: { order_id: order.order_id } });
      cart.clear();

      if ("checkout_url" in payment && payment.checkout_url) {
        window.location.href = payment.checkout_url;
        return;
      }
      navigate({ to: "/pedido/$id", params: { id: order.order_id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível concluir o pedido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl text-ink">Checkout</h1>
          <p className="mt-2 text-sm text-ash">Pagamento processado pelo Mercado Pago: Pix, cartão ou boleto.</p>
        </div>

        <section>
          <p className="eyebrow">Seus dados</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" name="name" value={form.name} onChange={set("name")} className="sm:col-span-2" autoComplete="name" />
            <Field label="E-mail" name="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
            <Field label="Telefone / WhatsApp" name="phone" value={form.phone} onChange={set("phone")} autoComplete="tel" />
            <Field label="CPF" name="cpf" value={form.cpf} onChange={set("cpf")} />
          </div>
        </section>

        <section>
          <p className="eyebrow">Entrega</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-6">
            <Field label="CEP" name="cep" value={form.cep} onChange={set("cep")} className="sm:col-span-2" autoComplete="postal-code" />
            <Field label="Rua" name="street" value={form.street} onChange={set("street")} className="sm:col-span-4" autoComplete="address-line1" />
            <Field label="Número" name="number" value={form.number} onChange={set("number")} className="sm:col-span-2" />
            <Field label="Complemento" name="complement" value={form.complement} onChange={set("complement")} className="sm:col-span-4" />
            <Field label="Bairro" name="district" value={form.district} onChange={set("district")} className="sm:col-span-3" />
            <Field label="Cidade" name="city" value={form.city} onChange={set("city")} className="sm:col-span-2" />
            <Field label="UF" name="state" value={form.state} onChange={set("state")} maxLength={2} className="sm:col-span-1" />
          </div>
        </section>
      </div>

      <aside className="h-fit border border-border bg-card p-6">
        <h2 className="font-display text-2xl text-ink">Resumo</h2>
        <ul className="mt-4 space-y-3 border-b border-border pb-4">
          {cart.items.map((i) => (
            <li key={i.product_id} className="flex justify-between gap-3 text-sm">
              <span className="text-ash">
                {i.quantity}× {i.name}
              </span>
              <span className="text-ink">{brl(i.unit_price_cents * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Cupom de desconto"
            maxLength={40}
            className="w-full border border-input bg-ivory px-3 py-2 text-sm outline-none"
          />
          <button type="button" onClick={applyCoupon} className="border border-ink px-4 text-[11px] uppercase tracking-[0.16em]">
            Aplicar
          </button>
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between text-ash">
            <dt>Subtotal</dt>
            <dd>{brl(totals.subtotal)}</dd>
          </div>
          {totals.promoDiscount > 0 && (
            <div className="flex justify-between text-clay">
              <dt>Desconto 10% (2+)</dt>
              <dd>− {brl(totals.promoDiscount)}</dd>
            </div>
          )}
          {totals.couponDiscount > 0 && (
            <div className="flex justify-between text-clay">
              <dt>Cupom {applied?.code}</dt>
              <dd>− {brl(totals.couponDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-base text-ink">
            <dt>Total</dt>
            <dd>{brl(totals.total)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full bg-ink py-4 text-[11px] uppercase tracking-[0.22em] text-ivory disabled:opacity-50"
        >
          {busy ? "Processando..." : "Pagar com Mercado Pago"}
        </button>
        <p className="mt-3 text-center text-[11px] text-ash">Ambiente seguro · Dados criptografados</p>
      </aside>
    </form>
  );
}
