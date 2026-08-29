export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      monthly_rent_records: {
        Row: {
          collected_amount: number
          created_at: string
          expected_amount: number
          id: number
          month: string
          notes: string | null
          rental_space_id: number
          status: Database["public"]["Enums"]["rent_status"]
          updated_at: string
        }
        Insert: {
          collected_amount?: number
          created_at?: string
          expected_amount: number
          id?: never
          month: string
          notes?: string | null
          rental_space_id: number
          status: Database["public"]["Enums"]["rent_status"]
          updated_at?: string
        }
        Update: {
          collected_amount?: number
          created_at?: string
          expected_amount?: number
          id?: never
          month?: string
          notes?: string | null
          rental_space_id?: number
          status?: Database["public"]["Enums"]["rent_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_rent_records_rental_space_id_fkey"
            columns: ["rental_space_id"]
            isOneToOne: false
            referencedRelation: "rental_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_utility_bills: {
        Row: {
          amount: number
          created_at: string
          id: number
          month: string
          notes: string | null
          updated_at: string
          utility_account_id: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: never
          month: string
          notes?: string | null
          updated_at?: string
          utility_account_id: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: never
          month?: string
          notes?: string | null
          updated_at?: string
          utility_account_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_utility_bills_utility_account_id_fkey"
            columns: ["utility_account_id"]
            isOneToOne: false
            referencedRelation: "utility_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      mortgage_periods: {
        Row: {
          created_at: string
          end_month: string | null
          id: number
          interest_rate: number | null
          lender: string | null
          name: string
          notes: string | null
          property_id: number
          scheduled_payment: number
          start_month: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_month?: string | null
          id?: never
          interest_rate?: number | null
          lender?: string | null
          name: string
          notes?: string | null
          property_id: number
          scheduled_payment: number
          start_month: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_month?: string | null
          id?: never
          interest_rate?: number | null
          lender?: string | null
          name?: string
          notes?: string | null
          property_id?: number
          scheduled_payment?: number
          start_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mortgage_periods_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          city: string
          created_at: string
          id: number
          nickname: string
          purchase_price: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          street_address: string
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: never
          nickname: string
          purchase_price?: number | null
          state: string
          status?: Database["public"]["Enums"]["property_status"]
          street_address: string
          updated_at?: string
          user_id?: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: never
          nickname?: string
          purchase_price?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          street_address?: string
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      rental_spaces: {
        Row: {
          created_at: string
          end_month: string | null
          id: number
          name: string
          space_type: Database["public"]["Enums"]["rental_space_type"]
          start_month: string
          unit_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_month?: string | null
          id?: never
          name: string
          space_type: Database["public"]["Enums"]["rental_space_type"]
          start_month: string
          unit_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_month?: string | null
          id?: never
          name?: string
          space_type?: Database["public"]["Enums"]["rental_space_type"]
          start_month?: string
          unit_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_spaces_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          display_order: number
          id: number
          name: string
          property_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: never
          name: string
          property_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: never
          name?: string
          property_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_account_units: {
        Row: {
          created_at: string
          property_id: number
          unit_id: number
          utility_account_id: number
        }
        Insert: {
          created_at?: string
          property_id: number
          unit_id: number
          utility_account_id: number
        }
        Update: {
          created_at?: string
          property_id?: number
          unit_id?: number
          utility_account_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "utility_account_units_account_fk"
            columns: ["utility_account_id", "property_id"]
            isOneToOne: false
            referencedRelation: "utility_accounts"
            referencedColumns: ["id", "property_id"]
          },
          {
            foreignKeyName: "utility_account_units_unit_fk"
            columns: ["unit_id", "property_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id", "property_id"]
          },
        ]
      }
      utility_accounts: {
        Row: {
          created_at: string
          end_month: string | null
          id: number
          name: string
          notes: string | null
          property_id: number
          start_month: string
          updated_at: string
          utility_category_id: number
        }
        Insert: {
          created_at?: string
          end_month?: string | null
          id?: never
          name: string
          notes?: string | null
          property_id: number
          start_month: string
          updated_at?: string
          utility_category_id: number
        }
        Update: {
          created_at?: string
          end_month?: string | null
          id?: never
          name?: string
          notes?: string | null
          property_id?: number
          start_month?: string
          updated_at?: string
          utility_category_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "utility_accounts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utility_accounts_utility_category_id_fkey"
            columns: ["utility_category_id"]
            isOneToOne: false
            referencedRelation: "utility_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      utility_categories: {
        Row: {
          code: string
          display_name: string
          display_order: number
          id: number
        }
        Insert: {
          code: string
          display_name: string
          display_order: number
          id?: never
        }
        Update: {
          code?: string
          display_name?: string
          display_order?: number
          id?: never
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      property_status: "active" | "inactive" | "sold"
      rent_status: "occupied" | "vacant" | "partial_month" | "nonpaying"
      rental_space_type: "whole_unit" | "room"
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
      property_status: ["active", "inactive", "sold"],
      rent_status: ["occupied", "vacant", "partial_month", "nonpaying"],
      rental_space_type: ["whole_unit", "room"],
    },
  },
} as const

