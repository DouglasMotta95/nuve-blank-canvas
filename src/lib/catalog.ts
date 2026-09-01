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

const SELECT = "*, product_images(id,url,alt,sort_order,is_cover,fit,is_before_after)";

function normalize(row: any): Product {
  return {
    ...row,
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    actives: Array.isArray(row.actives) ? row.actives : [],
    how_to_use: Array.isArray(row.how_to_use) ? row.how_to_use : [],
    product_images: (row.product_images ?? []).sort(
      (a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order,
    ),
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
    return (data ?? []).map(normalize);
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
      return data ? normalize(data) : null;
    },
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSetting<T = any>(key: string) {
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
