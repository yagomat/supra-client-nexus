
export interface MensagemWhatsApp {
  id: string;
  user_id: string;
  tipo_mensagem: 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago' | string;
  mensagem: string;
  created_at: string;
  updated_at: string;
  is_template_padrao?: boolean;
  nome_template?: string;
}

export type TipoMensagem = 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago';
