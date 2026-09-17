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
      admin_audit_log: {
        Row: {
          created_at: string
          details: Json
          event: string
          id: string
          page: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          event: string
          id?: string
          page?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          event?: string
          id?: string
          page?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advisor_leads: {
        Row: {
          city: string | null
          conversation_summary: string | null
          created_at: string
          id: string
          initial_budget: string | null
          lead_score: string
          model_interest: string | null
          monthly_budget: string | null
          name: string | null
          phone: string | null
          purchase_method: string | null
          status: string
          use_case: string | null
        }
        Insert: {
          city?: string | null
          conversation_summary?: string | null
          created_at?: string
          id?: string
          initial_budget?: string | null
          lead_score?: string
          model_interest?: string | null
          monthly_budget?: string | null
          name?: string | null
          phone?: string | null
          purchase_method?: string | null
          status?: string
          use_case?: string | null
        }
        Update: {
          city?: string | null
          conversation_summary?: string | null
          created_at?: string
          id?: string
          initial_budget?: string | null
          lead_score?: string
          model_interest?: string | null
          monthly_budget?: string | null
          name?: string | null
          phone?: string | null
          purchase_method?: string | null
          status?: string
          use_case?: string | null
        }
        Relationships: []
      }
      catalog_audit: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          plan_id: string
          user_email: string | null
          user_id: string | null
          version_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          plan_id: string
          user_email?: string | null
          user_id?: string | null
          version_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          plan_id?: string
          user_email?: string | null
          user_id?: string | null
          version_id?: string | null
        }
        Relationships: []
      }
      catalog_entries: {
        Row: {
          change_type: string
          conditions: string | null
          created_at: string
          edited_fields: string[]
          extra: Json
          id: string
          installment_amount: number | null
          installments_count: number | null
          model_name: string
          position: number
          pre_delivery_amount: number | null
          promo: string | null
          signature_amount: number | null
          updated_at: string
          vehicle_id: string | null
          version_id: string
          version_label: string | null
        }
        Insert: {
          change_type?: string
          conditions?: string | null
          created_at?: string
          edited_fields?: string[]
          extra?: Json
          id?: string
          installment_amount?: number | null
          installments_count?: number | null
          model_name: string
          position?: number
          pre_delivery_amount?: number | null
          promo?: string | null
          signature_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
          version_id: string
          version_label?: string | null
        }
        Update: {
          change_type?: string
          conditions?: string | null
          created_at?: string
          edited_fields?: string[]
          extra?: Json
          id?: string
          installment_amount?: number | null
          installments_count?: number | null
          model_name?: string
          position?: number
          pre_delivery_amount?: number | null
          promo?: string | null
          signature_amount?: number | null
          updated_at?: string
          vehicle_id?: string | null
          version_id?: string
          version_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_entries_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "catalog_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_versions: {
        Row: {
          catalog_date: string
          created_at: string
          created_by: string | null
          entries_count: number
          id: string
          notes: string | null
          pdf_path: string | null
          plan_id: string
          published_at: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          catalog_date: string
          created_at?: string
          created_by?: string | null
          entries_count?: number
          id?: string
          notes?: string | null
          pdf_path?: string | null
          plan_id: string
          published_at?: string | null
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          catalog_date?: string
          created_at?: string
          created_by?: string | null
          entries_count?: number
          id?: string
          notes?: string | null
          pdf_path?: string | null
          plan_id?: string
          published_at?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_events: {
        Row: {
          action: string
          created_at: string
          id: string
          model: string | null
          page: string | null
          plan: string | null
          source: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          model?: string | null
          page?: string | null
          plan?: string | null
          source?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          model?: string | null
          page?: string | null
          plan?: string | null
          source?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message: string
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      credit_applications: {
        Row: {
          created_at: string
          documents: Json
          email: string | null
          full_name: string
          id: string
          id_number: string
          message: string | null
          monthly_income: string | null
          occupation: string | null
          phone: string
          plan_id: string
          plan_name: string
          status: string
          vehicle_name: string | null
        }
        Insert: {
          created_at?: string
          documents?: Json
          email?: string | null
          full_name: string
          id?: string
          id_number: string
          message?: string | null
          monthly_income?: string | null
          occupation?: string | null
          phone: string
          plan_id: string
          plan_name: string
          status?: string
          vehicle_name?: string | null
        }
        Update: {
          created_at?: string
          documents?: Json
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string
          message?: string | null
          monthly_income?: string | null
          occupation?: string | null
          phone?: string
          plan_id?: string
          plan_name?: string
          status?: string
          vehicle_name?: string | null
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          plan_name: string
          status: string
          vehicle_name: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          plan_name: string
          status?: string
          vehicle_name: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          plan_name?: string
          status?: string
          vehicle_name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean
          created_at: string
          customer_name: string
          id: string
          message: string
          photo_url: string | null
          rating: number
          vehicle_name: string | null
        }
        Insert: {
          approved?: boolean
          created_at?: string
          customer_name: string
          id?: string
          message: string
          photo_url?: string | null
          rating: number
          vehicle_name?: string | null
        }
        Update: {
          approved?: boolean
          created_at?: string
          customer_name?: string
          id?: string
          message?: string
          photo_url?: string | null
          rating?: number
          vehicle_name?: string | null
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
      contact_stats: { Args: { days?: number }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      publish_catalog_version: {
        Args: { _version_id: string }
        Returns: undefined
      }
      rollback_catalog_version: {
        Args: { _version_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
