
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

export interface TemplatePersonalizado {
  id: string;
  tipo_mensagem: string;
  nome_template: string;
  mensagem: string;
  is_template_padrao: boolean;
}

export interface RpcResponse {
  success: boolean;
  message: string;
  template_id?: string;
  tipo_mensagem?: string;
}
