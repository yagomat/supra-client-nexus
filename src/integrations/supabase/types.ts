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
      audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          aplicativo: string
          aplicativo_2: string | null
          created_at: string
          data_licenca_2: string | null
          data_licenca_aplicativo: string | null
          dia_vencimento: number
          dispositivo_smart: string | null
          dispositivo_smart_2: string | null
          id: string
          nome: string
          observacoes: string | null
          possui_tela_adicional: boolean | null
          senha_2: string | null
          senha_aplicativo: string
          servidor: string
          status: string | null
          telefone: string | null
          uf: string | null
          user_id: string
          usuario_2: string | null
          usuario_aplicativo: string
          valor_plano: number | null
        }
        Insert: {
          aplicativo: string
          aplicativo_2?: string | null
          created_at?: string
          data_licenca_2?: string | null
          data_licenca_aplicativo?: string | null
          dia_vencimento: number
          dispositivo_smart?: string | null
          dispositivo_smart_2?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          possui_tela_adicional?: boolean | null
          senha_2?: string | null
          senha_aplicativo: string
          servidor: string
          status?: string | null
          telefone?: string | null
          uf?: string | null
          user_id: string
          usuario_2?: string | null
          usuario_aplicativo: string
          valor_plano?: number | null
        }
        Update: {
          aplicativo?: string
          aplicativo_2?: string | null
          created_at?: string
          data_licenca_2?: string | null
          data_licenca_aplicativo?: string | null
          dia_vencimento?: number
          dispositivo_smart?: string | null
          dispositivo_smart_2?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          possui_tela_adicional?: boolean | null
          senha_2?: string | null
          senha_aplicativo?: string
          servidor?: string
          status?: string | null
          telefone?: string | null
          uf?: string | null
          user_id?: string
          usuario_2?: string | null
          usuario_aplicativo?: string
          valor_plano?: number | null
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          ano: number
          cliente_id: string
          created_at: string
          data_pagamento: string | null
          id: string
          mes: number
          status: string
          updated_at: string | null
        }
        Insert: {
          ano: number
          cliente_id: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          mes: number
          status: string
          updated_at?: string | null
        }
        Update: {
          ano?: number
          cliente_id?: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          mes?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string | null
          telefone: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      valores_predefinidos: {
        Row: {
          id: string
          tipo: string
          user_id: string
          valor: string
        }
        Insert: {
          id?: string
          tipo: string
          user_id: string
          valor: string
        }
        Update: {
          id?: string
          tipo?: string
          user_id?: string
          valor?: string
        }
        Relationships: []
      }
      whatsapp_commands: {
        Row: {
          command: string
          created_at: string
          error_message: string | null
          id: string
          message_received: string
          response_sent: string | null
          status: string
          user_id: string
        }
        Insert: {
          command: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_received: string
          response_sent?: string | null
          status?: string
          user_id: string
        }
        Update: {
          command?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message_received?: string
          response_sent?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          created_at: string
          id: string
          last_connected: string | null
          phone_number: string | null
          qr_code: string | null
          session_data: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_connected?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_data?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_connected?: string | null
          phone_number?: string | null
          qr_code?: string | null
          session_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_table_to_publication: {
        Args: { table_name: string }
        Returns: undefined
      }
      add_valor_predefinido: {
        Args: { p_user_id: string; p_tipo: string; p_valor: string }
        Returns: Json
      }
      check_cliente_licencas: {
        Args: { p_cliente_id: string }
        Returns: Json
      }
      check_licenca_status: {
        Args: { p_data_licenca: string }
        Returns: Json
      }
      cliente_pertence_ao_usuario: {
        Args: { cliente_id_param: string }
        Returns: boolean
      }
      delete_valor_predefinido: {
        Args: { p_user_id: string; p_tipo: string; p_valor: string }
        Returns: Json
      }
      filter_audit_logs: {
        Args: {
          p_event_type?: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }[]
      }
      filter_clientes_by_status: {
        Args: { p_status?: string; p_user_id?: string }
        Returns: {
          aplicativo: string
          aplicativo_2: string | null
          created_at: string
          data_licenca_2: string | null
          data_licenca_aplicativo: string | null
          dia_vencimento: number
          dispositivo_smart: string | null
          dispositivo_smart_2: string | null
          id: string
          nome: string
          observacoes: string | null
          possui_tela_adicional: boolean | null
          senha_2: string | null
          senha_aplicativo: string
          servidor: string
          status: string | null
          telefone: string | null
          uf: string | null
          user_id: string
          usuario_2: string | null
          usuario_aplicativo: string
          valor_plano: number | null
        }[]
      }
      filter_pagamentos: {
        Args:
          | {
              p_cliente_id?: string
              p_mes?: number
              p_ano?: number
              p_status?: string
              p_user_id?: string
            }
          | {
              p_cliente_id?: string
              p_mes?: number
              p_ano?: number
              p_status?: string
              p_user_id?: string
              p_ordem?: string
            }
        Returns: {
          ano: number
          cliente_id: string
          created_at: string
          data_pagamento: string | null
          id: string
          mes: number
          status: string
          updated_at: string | null
        }[]
      }
      get_dashboard_stats: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_user_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }[]
      }
      get_valores_predefinidos: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_valores_predefinidos_ordered: {
        Args: { p_user_id: string; p_tipo?: string }
        Returns: Json
      }
      handle_payment_status_update: {
        Args: {
          p_cliente_id: string
          p_mes: number
          p_ano: number
          p_status: string
        }
        Returns: Json
      }
      import_valores_predefinidos: {
        Args: { p_user_id: string; p_tipo: string; p_valores: string[] }
        Returns: Json
      }
      log_audit_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_details: Json
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      process_whatsapp_command: {
        Args: {
          p_user_id: string
          p_command: string
          p_message_received: string
        }
        Returns: Json
      }
      recalculate_all_client_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_cliente_data: {
        Args: {
          p_nome: string
          p_telefone: string
          p_uf: string
          p_servidor: string
          p_dia_vencimento: number
          p_valor_plano: number
          p_aplicativo: string
          p_usuario_aplicativo: string
          p_senha_aplicativo: string
        }
        Returns: Json
      }
      validate_valor_predefinido: {
        Args: { p_tipo: string; p_valor: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
