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
      document_runs: {
        Row: {
          api_key_mode: string
          created_at: string
          id: string
          model_name: string
          model_provider: string
          pdf_name: string
          pdf_storage_path: string | null
          session_id: string
          status: string
          user_name: string
        }
        Insert: {
          api_key_mode: string
          created_at?: string
          id?: string
          model_name: string
          model_provider?: string
          pdf_name: string
          pdf_storage_path?: string | null
          session_id: string
          status?: string
          user_name: string
        }
        Update: {
          api_key_mode?: string
          created_at?: string
          id?: string
          model_name?: string
          model_provider?: string
          pdf_name?: string
          pdf_storage_path?: string | null
          session_id?: string
          status?: string
          user_name?: string
        }
        Relationships: []
      }
      extraction_results: {
        Row: {
          created_at: string
          id: string
          parameter_1: string | null
          parameter_10: string | null
          parameter_11: string | null
          parameter_12: string | null
          parameter_13: string | null
          parameter_2: string | null
          parameter_3: string | null
          parameter_4: string | null
          parameter_5: string | null
          parameter_6: string | null
          parameter_7: string | null
          parameter_8: string | null
          parameter_9: string | null
          pdf_name: string
          raw_response: Json | null
          run_id: string
          session_id: string
          user_name: string
          user_pdf_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          parameter_1?: string | null
          parameter_10?: string | null
          parameter_11?: string | null
          parameter_12?: string | null
          parameter_13?: string | null
          parameter_2?: string | null
          parameter_3?: string | null
          parameter_4?: string | null
          parameter_5?: string | null
          parameter_6?: string | null
          parameter_7?: string | null
          parameter_8?: string | null
          parameter_9?: string | null
          pdf_name: string
          raw_response?: Json | null
          run_id: string
          session_id: string
          user_name: string
          user_pdf_key: string
        }
        Update: {
          created_at?: string
          id?: string
          parameter_1?: string | null
          parameter_10?: string | null
          parameter_11?: string | null
          parameter_12?: string | null
          parameter_13?: string | null
          parameter_2?: string | null
          parameter_3?: string | null
          parameter_4?: string | null
          parameter_5?: string | null
          parameter_6?: string | null
          parameter_7?: string | null
          parameter_8?: string | null
          parameter_9?: string | null
          pdf_name?: string
          raw_response?: Json | null
          run_id?: string
          session_id?: string
          user_name?: string
          user_pdf_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "extraction_results_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "document_runs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
