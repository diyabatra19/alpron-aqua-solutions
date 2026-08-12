export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AdminRole = "super_admin" | "content_editor" | "sales_manager";
export type ProductStatus = "draft" | "published" | "archived";
export type AvailabilityStatus =
  | "contact_for_availability"
  | "in_stock"
  | "made_to_order"
  | "out_of_stock"
  | "discontinued";
export type InquiryStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "closed"
  | "spam";
export type VerificationStatus = "unverified" | "verified" | "rejected";

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          user_id: string;
          role: AdminRole;
          display_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role?: AdminRole;
          display_name?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_alt: string;
          parent_id: string | null;
          media_asset_id: string | null;
          is_active: boolean;
          display_order: number;
          status: ProductStatus;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sku: string | null;
          category_id: string;
          short_description: string;
          full_description: Json;
          price_paise: number | null;
          show_price: boolean;
          currency: string;
          minimum_order_quantity: number | null;
          minimum_order_unit: string | null;
          availability: AvailabilityStatus;
          featured: boolean;
          display_order: number;
          status: ProductStatus;
          seo_title: string | null;
          seo_description: string | null;
          canonical_url: string | null;
          source_url: string | null;
          verification_status: VerificationStatus;
          verified_at: string | null;
          verified_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      product_specifications: {
        Row: {
          id: string;
          product_id: string;
          specification_key: string;
          specification_value: string;
          display_order: number;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          media_asset_id: string;
          alt_text: string;
          display_order: number;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          content: Json;
          status: ProductStatus;
          seo_title: string | null;
          seo_description: string | null;
          canonical_url: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      page_versions: {
        Row: {
          id: number;
          page_id: string;
          title: string;
          content: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: boolean;
          brand_name: string;
          default_seo_title: string;
          default_seo_description: string;
          hero_title: string;
          hero_description: string;
          about_title: string;
          about_summary: string;
          why_choose_intro: string;
          ordering_intro: string;
          ordering_process: string;
          contact_intro: string;
          cta_title: string;
          cta_description: string;
          google_site_verification: string | null;
          analytics_id: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      business_facts: {
        Row: {
          id: string;
          fact_key: string;
          label: string;
          fact_value: string | null;
          verification_status: VerificationStatus;
          public_visible: boolean;
          source_url: string | null;
          verified_at: string | null;
          verified_by: string | null;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          customer_name: string;
          phone: string;
          email: string | null;
          city: string;
          product_id: string | null;
          required_quantity: string;
          message: string;
          consent_accepted: boolean;
          source_page: string;
          status: InquiryStatus;
          submitted_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          storage_path: string;
          public_url: string;
          original_filename: string;
          mime_type: string;
          byte_size: number;
          width: number;
          height: number;
          alt_text: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      inquiry_notes: {
        Row: {
          id: string;
          inquiry_id: string;
          note: string;
          created_by: string;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: number;
          actor_id: string | null;
          event_type: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_rate_limit: {
        Args: {
          p_key_hash: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: boolean;
      };
      save_product: {
        Args: {
          p_product: Json;
          p_specifications?: Json;
          p_media_ids?: string[];
        };
        Returns: string;
      };
    };
    Enums: {
      admin_role: AdminRole;
      product_status: ProductStatus;
      availability_status: AvailabilityStatus;
      inquiry_status: InquiryStatus;
      verification_status: VerificationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
