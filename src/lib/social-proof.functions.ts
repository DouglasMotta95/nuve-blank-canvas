import { createServerFn } from "@tanstack/react-start";

export type SocialProofItem = {
  name: string;
  city: string;
  product: string;
  minutesAgo: number;
};

function firstName(full: string) {
  const n = (full ?? "").trim().split(/\s+/)[0] ?? "";
  return n.length > 1 ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : "Cliente";
}

export const recentPurchases = createServerFn({ method: "GET" }).handler(async (): Promise<{
  enabled: boolean;
  items: SocialProofItem[];
}> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: setting } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "social_proof")
    .maybeSingle();

  const value = (setting?.value ?? {}) as { enabled?: boolean };
  if (value.enabled === false) return { enabled: false, items: [] };

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();
  const { data } = await supabaseAdmin
    .from("orders")
    .select("customer_name, shipping, created_at, order_items(name)")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(12);

  const items: SocialProofItem[] = (data ?? [])
    .map((o: any) => {
      const shipping = (o.shipping ?? {}) as { city?: string; state?: string };
      const product = o.order_items?.[0]?.name ?? "NUVE Advanced";
      const city = shipping.city ? `${shipping.city}${shipping.state ? `/${shipping.state}` : ""}` : "Brasil";
      return {
        name: firstName(o.customer_name),
        city,
        product,
        minutesAgo: Math.max(1, Math.round((Date.now() - new Date(o.created_at).getTime()) / 60000)),
      };
    })
    .slice(0, 8);

  return { enabled: true, items };
});
