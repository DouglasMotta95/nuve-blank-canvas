export function brl(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function installments(cents: number, n = 6): string {
  return `${n}x de ${brl(Math.round(cents / n))} sem juros`;
}

export const PROMO_MIN_QTY = 2;
export const PROMO_PERCENT = 10;

export type CartLine = { quantity: number; unit_price_cents: number };

export function computeTotals(
  lines: CartLine[],
  opts: {
    promoMinQty?: number | undefined;
    promoPercent?: number | undefined;
    couponPercent?: number | null | undefined;
    couponAmountCents?: number | null | undefined;
  } = {},
) {
  const promoMinQty = opts.promoMinQty ?? PROMO_MIN_QTY;
  const promoPercent = opts.promoPercent ?? PROMO_PERCENT;
  const quantity = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unit_price_cents, 0);
  const promoDiscount = quantity >= promoMinQty ? Math.round((subtotal * promoPercent) / 100) : 0;
  const afterPromo = subtotal - promoDiscount;
  let couponDiscount = 0;
  if (opts.couponPercent) couponDiscount = Math.round((afterPromo * opts.couponPercent) / 100);
  else if (opts.couponAmountCents) couponDiscount = Math.min(opts.couponAmountCents, afterPromo);
  const total = Math.max(0, afterPromo - couponDiscount);
  return { quantity, subtotal, promoDiscount, couponDiscount, total };
}
