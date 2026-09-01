export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          cep: string
          city: string
          complement: string | null
          created_at: string
          district: string
          id: string
          label: string | null
          number: string
          recipient: string | null
          state: string
          street: string
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          created_at?: string
          district: string
          id?: string
          label?: string | null
          number: string
          recipient?: string | null
          state: string
          street: string
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          created_at?: string
          district?: string
          id?: string
          label?: string | null
          number?: string
          recipient?: string | null
          state?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          active: boolean
          created_at: string
          cta_label: string | null
          cta_link: string | null
          ends_at: string | null
          id: string
          image_desktop: string
          image_fit: string
          image_mobile: string | null
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          ends_at?: string | null
          id?: string
          image_desktop: string
          image_fit?: string
          image_mobile?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          ends_at?: string | null
          id?: string
          image_desktop?: string
          image_fit?: string
          image_mobile?: string | null
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          created_at: string
          customer_email: string | null
          id: string
          order_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string
          customer_email?: string | null
          id?: string
          order_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string
          customer_email?: string | null
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          amount_off_cents: number | null
          code: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          max_uses: number | null
          max_uses_per_customer: number | null
          min_order_cents: number
          percent_off: number | null
          starts_at: string | null
          uses: number
        }
        Insert: {
          active?: boolean
          amount_off_cents?: number | null
          code: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_cents?: number
          percent_off?: number | null
          starts_at?: string | null
          uses?: number
        }
        Update: {
          active?: boolean
          amount_off_cents?: number | null
          code?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_cents?: number
          percent_off?: number | null
          starts_at?: string | null
          uses?: number
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          delta: number
          id: string
          product_id: string
          reason: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          product_id: string
          reason: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          product_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          active: boolean
          description: string | null
          id: string
          image: string | null
          name: string
          percent_off: number
          product_slugs: Json
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          description?: string | null
          id?: string
          image?: string | null
          name: string
          percent_off?: number
          product_slugs?: Json
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          percent_off?: number
          product_slugs?: Json
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          sku: string
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          quantity: number
          sku: string
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          sku?: string
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          coupon_discount_cents: number
          created_at: string
          customer_cpf: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          order_number: string
          payment_status: string
          promo_discount_cents: number
          shipping: Json
          shipping_cents: number
          status: string
          subtotal_cents: number
          total_cents: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coupon_code?: string | null
          coupon_discount_cents?: number
          created_at?: string
          customer_cpf?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          order_number: string
          payment_status?: string
          promo_discount_cents?: number
          shipping?: Json
          shipping_cents?: number
          status?: string
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coupon_code?: string | null
          coupon_discount_cents?: number
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          order_number?: string
          payment_status?: string
          promo_discount_cents?: number
          shipping?: Json
          shipping_cents?: number
          status?: string
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          order_id: string
          provider: string
          provider_payment_id: string | null
          provider_preference_id: string | null
          raw: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          order_id: string
          provider?: string
          provider_payment_id?: string | null
          provider_preference_id?: string | null
          raw?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          provider_preference_id?: string | null
          raw?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          fit: string
          id: string
          is_cover: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt?: string | null
          fit?: string
          id?: string
          is_cover?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt?: string | null
          fit?: string
          id?: string
          is_cover?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          accent: string | null
          active: boolean
          actives: Json
          benefits: Json
          best_for: string | null
          created_at: string
          description: string | null
          featured: boolean
          how_to_use: Json
          id: string
          kind: string
          name: string
          price_cents: number
          routine: string | null
          sale_price_cents: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string
          slug: string
          sort_order: number
          stock: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent?: string | null
          active?: boolean
          actives?: Json
          benefits?: Json
          best_for?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          how_to_use?: Json
          id?: string
          kind?: string
          name: string
          price_cents?: number
          routine?: string | null
          sale_price_cents?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku: string
          slug: string
          sort_order?: number
          stock?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent?: string | null
          active?: boolean
          actives?: Json
          benefits?: Json
          best_for?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          how_to_use?: Json
          id?: string
          kind?: string
          name?: string
          price_cents?: number
          routine?: string | null
          sale_price_cents?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string
          slug?: string
          sort_order?: number
          stock?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          min_quantity: number
          name: string
          percent_off: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          min_quantity?: number
          name: string
          percent_off?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          min_quantity?: number
          name?: string
          percent_off?: number
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          author_name: string
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          approved?: boolean
          author_name: string
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          user_id?: string | null
        }
        Update: {
          approved?: boolean
          author_name?: string
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_order_number: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const
