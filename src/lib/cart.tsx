import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeTotals } from "./format";

export type CartItem = {
  product_id: string;
  slug: string;
  sku: string;
  name: string;
  unit_price_cents: number;
  image: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (product_id: string) => void;
  setQuantity: (product_id: string, quantity: number) => void;
  clear: () => void;
  count: number;
  totals: ReturnType<typeof computeTotals>;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const KEY = "nuve.cart.v1";
const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartState>(() => {
    return {
      items,
      open,
      setOpen,
      add: (item, quantity = 1) =>
        setItems((prev) => {
          const found = prev.find((i) => i.product_id === item.product_id);
          if (found)
            return prev.map((i) =>
              i.product_id === item.product_id ? { ...i, quantity: i.quantity + quantity } : i,
            );
          return [...prev, { ...item, quantity }];
        }),
      remove: (id) => setItems((prev) => prev.filter((i) => i.product_id !== id)),
      setQuantity: (id, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.product_id !== id)
            : prev.map((i) => (i.product_id === id ? { ...i, quantity } : i)),
        ),
      clear: () => setItems([]),
      count: items.reduce((s, i) => s + i.quantity, 0),
      totals: computeTotals(items),
    };
  }, [items, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
