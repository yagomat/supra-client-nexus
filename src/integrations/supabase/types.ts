export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      cliente_cobrancas: {
        Row: {
          ano_referencia: number
          cliente_id: string
          created_at: string
          data_ultimo_aviso: string | null
          id: string
          mes_referencia: number
          ultimo_aviso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano_referencia: number
          cliente_id: string
          created_at?: string
          data_ultimo_aviso?: string | null
          id?: string
          mes_referencia: number
          ultimo_aviso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano_referencia?: number
          cliente_id?: string
          created_at?: string
          data_ultimo_aviso?: string | null
          id?: string
          mes_referencia?: number
          ultimo_aviso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_cobrancas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          aplicativo: string
          aplicativo_2: string | null
          codigo_pais_telefone: string | null
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
          codigo_pais_telefone?: string | null
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
          codigo_pais_telefone?: string | null
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
      mensagens_whatsapp: {
        Row: {
          created_at: string
          id: string
          is_template_padrao: boolean | null
          mensagem: string
          nome_template: string | null
          tipo_mensagem: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_template_padrao?: boolean | null
          mensagem: string
          nome_template?: string | null
          tipo_mensagem: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_template_padrao?: boolean | null
          mensagem?: string
          nome_template?: string | null
          tipo_mensagem?: string
          updated_at?: string
          user_id?: string
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
      calculate_cliente_payment_status: {
        Args: { p_cliente_id: string; p_user_id?: string }
        Returns: Json
      }
      calculate_cliente_sorting_priority: {
        Args: { p_cliente_id: string; p_user_id?: string }
        Returns: number
      }
      check_auth_rate_limit: {
        Args: {
          p_email: string
          p_operation: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_comprehensive_rate_limit: {
        Args: {
          p_user_id: string
          p_operation: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: Json
      }
      check_dashboard_rate_limit: {
        Args: {
          p_user_id: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_export_rate_limit: {
        Args: {
          p_user_id: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_operation_rate_limit: {
        Args: { p_user_id: string; p_operation: string }
        Returns: boolean
      }
      check_profile_rate_limit: {
        Args: {
          p_user_id: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_operation: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_templates_rate_limit: {
        Args: {
          p_user_id: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
      }
      check_valores_predefinidos_rate_limit: {
        Args: {
          p_user_id: string
          p_operation: string
          p_max_requests?: number
          p_time_window_minutes?: number
        }
        Returns: boolean
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
          codigo_pais_telefone: string | null
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
      filter_pagamentos_with_clients: {
        Args: {
          p_cliente_id?: string
          p_mes?: number
          p_ano?: number
          p_status?: string
          p_user_id?: string
          p_ordem?: string
        }
        Returns: {
          id: string
          cliente_id: string
          mes: number
          ano: number
          status: string
          data_pagamento: string
          created_at: string
          updated_at: string
          cliente_nome: string
          cliente_created_at: string
          cliente_dia_vencimento: number
          cliente_valor_plano: number
          cliente_status: string
          cliente_telefone: string
          cliente_uf: string
          cliente_servidor: string
          cliente_dispositivo_smart: string
          cliente_aplicativo: string
          cliente_usuario_aplicativo: string
          cliente_senha_aplicativo: string
          cliente_data_licenca_aplicativo: string
          cliente_possui_tela_adicional: boolean
          cliente_dispositivo_smart_2: string
          cliente_aplicativo_2: string
          cliente_usuario_2: string
          cliente_senha_2: string
          cliente_data_licenca_2: string
          cliente_observacoes: string
          cliente_user_id: string
        }[]
      }
      get_clientes_with_calculated_status: {
        Args: { p_user_id?: string; p_status?: string }
        Returns: {
          cliente_data: Json
          payment_status: Json
          sorting_priority: number
        }[]
      }
      get_dashboard_chart_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_dashboard_critical_stats: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_dashboard_stats: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_fila_cobranca: {
        Args: { p_user_id: string; p_mes: number; p_ano: number }
        Returns: {
          cliente_id: string
          cliente_nome: string
          cliente_telefone: string
          cliente_codigo_pais: string
          cliente_servidor: string
          cliente_status: string
          dia_vencimento: number
          valor_plano: number
          status_pagamento: string
          data_proximo_pagamento: string
          dias_para_vencimento: number
          ultimo_aviso: string
          data_ultimo_aviso: string
          prioridade: number
        }[]
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
      get_validation_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      log_auth_attempt: {
        Args: {
          p_email: string
          p_operation: string
          p_success: boolean
          p_error_message?: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_cliente_operation: {
        Args: {
          p_user_id: string
          p_operation: string
          p_cliente_id?: string
          p_old_data?: Json
          p_new_data?: Json
          p_ip_address?: string
        }
        Returns: undefined
      }
      log_export_attempt: {
        Args: { p_user_id: string; p_count: number }
        Returns: undefined
      }
      log_valores_predefinidos_export: {
        Args: { p_user_id: string; p_tipo: string; p_count: number }
        Returns: undefined
      }
      log_valores_predefinidos_operation: {
        Args: {
          p_user_id: string
          p_operation: string
          p_tipo: string
          p_valor?: string
          p_valores_count?: number
          p_ip_address?: string
        }
        Returns: undefined
      }
      recalculate_all_client_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_all_client_status_on_startup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      registrar_cobranca: {
        Args: {
          p_cliente_id: string
          p_user_id: string
          p_tipo_aviso: string
          p_mes: number
          p_ano: number
        }
        Returns: Json
      }
      sanitize_auth_input: {
        Args: { p_email: string; p_nome?: string }
        Returns: Json
      }
      sanitize_input_centralized: {
        Args: { p_input: string }
        Returns: string
      }
      secure_auth_attempt: {
        Args: {
          p_email: string
          p_password: string
          p_operation: string
          p_nome?: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      secure_create_cliente: {
        Args: { p_cliente_data: Json; p_ip_address?: string }
        Returns: Json
      }
      secure_delete_cliente: {
        Args: { p_cliente_id: string; p_ip_address?: string }
        Returns: Json
      }
      secure_update_cliente: {
        Args: {
          p_cliente_id: string
          p_cliente_data: Json
          p_ip_address?: string
        }
        Returns: Json
      }
      secure_update_profile: {
        Args: { p_user_id: string; p_nome: string; p_telefone: string }
        Returns: Json
      }
      secure_update_template: {
        Args: { p_user_id: string; p_tipo: string; p_mensagem: string }
        Returns: Json
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
      validate_cliente_data_centralized: {
        Args: {
          p_nome: string
          p_servidor: string
          p_dia_vencimento: number
          p_aplicativo: string
          p_usuario_aplicativo: string
          p_senha_aplicativo: string
          p_telefone?: string
          p_uf?: string
          p_valor_plano?: number
        }
        Returns: Json
      }
      validate_cliente_security: {
        Args: {
          p_nome: string
          p_servidor: string
          p_dia_vencimento: number
          p_aplicativo: string
          p_usuario_aplicativo: string
          p_senha_aplicativo: string
          p_telefone?: string
          p_uf?: string
          p_valor_plano?: number
          p_user_id?: string
        }
        Returns: Json
      }
      validate_password_strength: {
        Args: { p_password: string }
        Returns: Json
      }
      validate_profile_data: {
        Args: { p_nome: string; p_telefone: string }
        Returns: Json
      }
      validate_template_content: {
        Args: { p_mensagem: string; p_tipo: string }
        Returns: Json
      }
      validate_valor_predefinido: {
        Args: { p_tipo: string; p_valor: string }
        Returns: boolean
      }
      validate_valor_predefinido_centralized: {
        Args: { p_tipo: string; p_valor: string }
        Returns: Json
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
