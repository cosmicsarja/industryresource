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
      admin_logs: {
        Row: {
          action: string | null
          admin_id: string | null
          created_at: string
          id: string
          notes: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action?: string | null
          admin_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string | null
          admin_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["analytics_event_t"]
          id: string
          metadata: Json | null
          vendor_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["analytics_event_t"]
          id?: string
          metadata?: Json | null
          vendor_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["analytics_event_t"]
          id?: string
          metadata?: Json | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_ads: {
        Row: {
          advertiser_name: string
          click_count: number
          created_at: string
          ends_at: string | null
          id: string
          image_url: string
          impression_count: number
          is_active: boolean
          link_url: string | null
          placement: Database["public"]["Enums"]["ad_placement"]
          price_per_month: number | null
          starts_at: string | null
        }
        Insert: {
          advertiser_name: string
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url: string
          impression_count?: number
          is_active?: boolean
          link_url?: string | null
          placement: Database["public"]["Enums"]["ad_placement"]
          price_per_month?: number | null
          starts_at?: string | null
        }
        Update: {
          advertiser_name?: string
          click_count?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          image_url?: string
          impression_count?: number
          is_active?: boolean
          link_url?: string | null
          placement?: Database["public"]["Enums"]["ad_placement"]
          price_per_month?: number | null
          starts_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          name_kn: string | null
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_kn?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_kn?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          channel: Database["public"]["Enums"]["enquiry_channel"]
          created_at: string
          customer_id: string | null
          id: string
          message: string | null
          name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["enquiry_status"]
          vendor_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["enquiry_channel"]
          created_at?: string
          customer_id?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          vendor_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["enquiry_channel"]
          created_at?: string
          customer_id?: string | null
          id?: string
          message?: string | null
          name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          id: string
          plan_name: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          plan_name?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          plan_name?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          delivery_estimate: string | null
          id: string
          is_accepted: boolean
          message: string
          price_estimate: string | null
          requirement_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          delivery_estimate?: string | null
          id?: string
          is_accepted?: boolean
          message: string
          price_estimate?: string | null
          requirement_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          delivery_estimate?: string | null
          id?: string
          is_accepted?: boolean
          message?: string
          price_estimate?: string | null
          requirement_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          budget_range: string | null
          category_id: string | null
          created_at: string
          customer_id: string
          deadline: string | null
          description: string
          expires_at: string
          id: string
          is_urgent: boolean
          material: string | null
          quantity: string | null
          quote_count: number
          status: Database["public"]["Enums"]["requirement_status"]
          title: string
          zone_preference: string | null
        }
        Insert: {
          budget_range?: string | null
          category_id?: string | null
          created_at?: string
          customer_id: string
          deadline?: string | null
          description: string
          expires_at?: string
          id?: string
          is_urgent?: boolean
          material?: string | null
          quantity?: string | null
          quote_count?: number
          status?: Database["public"]["Enums"]["requirement_status"]
          title: string
          zone_preference?: string | null
        }
        Update: {
          budget_range?: string | null
          category_id?: string | null
          created_at?: string
          customer_id?: string
          deadline?: string | null
          description?: string
          expires_at?: string
          id?: string
          is_urgent?: boolean
          material?: string | null
          quantity?: string | null
          quote_count?: number
          status?: Database["public"]["Enums"]["requirement_status"]
          title?: string
          zone_preference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string
          id: string
          is_flagged: boolean
          is_verified: boolean
          job_type: string | null
          rating: number
          title: string | null
          vendor_id: string
          vendor_replied_at: string | null
          vendor_reply: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_flagged?: boolean
          is_verified?: boolean
          job_type?: string | null
          rating: number
          title?: string | null
          vendor_id: string
          vendor_replied_at?: string | null
          vendor_reply?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_flagged?: boolean
          is_verified?: boolean
          job_type?: string | null
          rating?: number
          title?: string | null
          vendor_id?: string
          vendor_replied_at?: string | null
          vendor_reply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_vendors: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_vendors_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          badge_color: string | null
          features: Json | null
          id: string
          is_featured: boolean
          max_photos: number
          name: string
          price_per_year: number
        }
        Insert: {
          badge_color?: string | null
          features?: Json | null
          id?: string
          is_featured?: boolean
          max_photos?: number
          name: string
          price_per_year: number
        }
        Update: {
          badge_color?: string | null
          features?: Json | null
          id?: string
          is_featured?: boolean
          max_photos?: number
          name?: string
          price_per_year?: number
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
      vendor_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          is_primary: boolean
          photo_url: string
          sort_order: number
          vendor_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          photo_url: string
          sort_order?: number
          vendor_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          photo_url?: string
          sort_order?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_photos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          business_name: string
          category_id: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          description_kn: string | null
          email: string | null
          employee_count: string | null
          enquiry_count: number
          established_year: number | null
          full_address: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_verified: boolean
          latitude: number | null
          longitude: number | null
          machine_list: Json | null
          phone: string
          profile_views: number
          rating_avg: number
          rating_count: number
          slug: string
          subscription_expires_at: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan_t"]
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
          whatsapp_clicks: number
          working_hours: Json | null
          zone: Database["public"]["Enums"]["belagavi_zone"] | null
        }
        Insert: {
          business_name: string
          category_id?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          description_kn?: string | null
          email?: string | null
          employee_count?: string | null
          enquiry_count?: number
          established_year?: number | null
          full_address?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          machine_list?: Json | null
          phone: string
          profile_views?: number
          rating_avg?: number
          rating_count?: number
          slug: string
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan_t"]
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
          whatsapp_clicks?: number
          working_hours?: Json | null
          zone?: Database["public"]["Enums"]["belagavi_zone"] | null
        }
        Update: {
          business_name?: string
          category_id?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          description_kn?: string | null
          email?: string | null
          employee_count?: string | null
          enquiry_count?: number
          established_year?: number | null
          full_address?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_verified?: boolean
          latitude?: number | null
          longitude?: number | null
          machine_list?: Json | null
          phone?: string
          profile_views?: number
          rating_avg?: number
          rating_count?: number
          slug?: string
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan_t"]
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
          whatsapp_clicks?: number
          working_hours?: Json | null
          zone?: Database["public"]["Enums"]["belagavi_zone"] | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      promote_to_admin: { Args: { _email: string }; Returns: string }
    }
    Enums: {
      ad_placement:
        | "homepage_top"
        | "homepage_sidebar"
        | "search_results"
        | "category_page"
        | "vendor_page"
      analytics_event_t:
        | "profile_view"
        | "whatsapp_click"
        | "call_click"
        | "enquiry"
        | "quote_sent"
        | "saved"
      app_role: "customer" | "vendor" | "admin"
      belagavi_zone:
        | "Udyambag"
        | "Auto Nagar"
        | "Machhe KIADB"
        | "Gokul Road"
        | "Khanapur Road"
        | "Bogarves"
        | "Shahapur"
        | "Other"
      enquiry_channel: "whatsapp" | "call" | "form" | "email"
      enquiry_status: "new" | "read" | "responded" | "closed"
      payment_status: "pending" | "success" | "failed" | "refunded"
      requirement_status: "open" | "in_progress" | "closed" | "fulfilled"
      subscription_plan_t: "free" | "standard" | "premium" | "gold"
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
      ad_placement: [
        "homepage_top",
        "homepage_sidebar",
        "search_results",
        "category_page",
        "vendor_page",
      ],
      analytics_event_t: [
        "profile_view",
        "whatsapp_click",
        "call_click",
        "enquiry",
        "quote_sent",
        "saved",
      ],
      app_role: ["customer", "vendor", "admin"],
      belagavi_zone: [
        "Udyambag",
        "Auto Nagar",
        "Machhe KIADB",
        "Gokul Road",
        "Khanapur Road",
        "Bogarves",
        "Shahapur",
        "Other",
      ],
      enquiry_channel: ["whatsapp", "call", "form", "email"],
      enquiry_status: ["new", "read", "responded", "closed"],
      payment_status: ["pending", "success", "failed", "refunded"],
      requirement_status: ["open", "in_progress", "closed", "fulfilled"],
      subscription_plan_t: ["free", "standard", "premium", "gold"],
    },
  },
} as const
