import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_cover: boolean;
  fit: string;
  is_before_after: boolean;
  active: boolean;
};

export type ActiveItem = { name: string; text: string };

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  tagline: string | null;
  short_description: string | null;
  description: string | null;
  price_cents: number;
  sale_price_cents: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  accent: string | null;
  benefits: string[];
  actives: ActiveItem[];
  how_to_use: string[];
  routine: string | null;
  best_for: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  product_images: ProductImage[];
};

export type BannerPlacement =
  | "hero"
  | "japan"
  | "science"
  | "editorial"
  | "promotional"
  | "fixed"
  | "line_details";

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
  image_desktop: string;
  image_mobile: string | null;
  image_fit: string;
  sort_order: number;
  active: boolean;
  placement: BannerPlacement | string;
  alt_text: string | null;
};

const SELECT = "*, product_images(id,url,alt,sort_order,is_cover,fit,is_before_after,active)";

function normalize(row: Record<string, unknown>): Product {
  const rawImages = Array.isArray(row.product_images) ? row.product_images : [];
  return {
    ...row,
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    actives: Array.isArray(row.actives) ? row.actives : [],
    how_to_use: Array.isArray(row.how_to_use) ? row.how_to_use : [],
    product_images: (rawImages as ProductImage[])
      .filter((image) => image.active !== false)
      .sort((a, b) => a.sort_order - b.sort_order),
  } as Product;
}

export function priceOf(p: Product): number {
  return p.sale_price_cents && p.sale_price_cents > 0 ? p.sale_price_cents : p.price_cents;
}

export function coverOf(p: Product): ProductImage | undefined {
  return p.product_images.find((i) => i.is_cover) ?? p.product_images[0];
}

export const productsQuery = {
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(SELECT)
      .eq("active", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((row) => normalize(row as Record<string, unknown>));
  },
};

export function useProducts() {
  return useQuery(productsQuery);
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select(SELECT).eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data ? normalize(data as Record<string, unknown>) : null;
    },
  });
}

export function useBanners(placement?: BannerPlacement | string) {
  return useQuery({
    queryKey: ["banners", placement ?? "all"],
    queryFn: async (): Promise<Banner[]> => {
      let query = supabase.from("banners").select("*").eq("active", true);
      if (placement) query = query.eq("placement", placement);
      const { data, error } = await query.order("sort_order");
      if (error) throw error;
      return (data ?? []) as Banner[];
    },
  });
}

export function useSetting<T = unknown>(key: string) {
  return useQuery({
    queryKey: ["setting", key],
    queryFn: async (): Promise<T | null> => {
      const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      return (data?.value as T) ?? null;
    },
  });
}

export function useKits() {
  return useQuery({
    queryKey: ["kits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kits").select("*").eq("active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useReviews(productId?: string) {
  return useQuery({
    queryKey: ["reviews", productId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false });
      if (productId) q = q.eq("product_id", productId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
