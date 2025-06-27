
export interface MensagemWhatsApp {
  id: string;
  user_id: string;
  tipo_mensagem: TipoMensagem;
  mensagem: string;
  created_at: string;
  updated_at: string;
}

export type TipoMensagem = 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago';
