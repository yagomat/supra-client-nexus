
import { useState, useEffect } from 'react';
import { mobileApiService, MobileClienteInfo, MobileTemplate } from '../services/mobileApiService';
import { useWhatsAppDetection } from './useWhatsAppDetection';
import { formatarMensagemWhatsAppComCliente } from '@/utils/whatsappUtils';
import { usePaymentHistory } from '@/hooks/cliente/usePaymentHistory';

export const useMobileClient = () => {
  const [cliente, setCliente] = useState<MobileClienteInfo | null>(null);
  const [templates, setTemplates] = useState<MobileTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentContact } = useWhatsAppDetection();
  const { payments: allPayments } = usePaymentHistory(cliente?.id || '');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (currentContact?.phoneNumber) {
      buscarCliente(currentContact.phoneNumber);
    }
  }, [currentContact]);

  const loadTemplates = async () => {
    const templatesData = await mobileApiService.buscarTemplates();
    setTemplates(templatesData);
  };

  const buscarCliente = async (telefone: string) => {
    setLoading(true);
    try {
      const clienteData = await mobileApiService.buscarClientePorTelefone(telefone);
      setCliente(clienteData);
    } finally {
      setLoading(false);
    }
  };

  const registrarAcao = async (acao: string, detalhes?: string) => {
    if (cliente) {
      await mobileApiService.registrarAcaoMobile(cliente.id, acao, detalhes);
    }
  };

  const formatarTemplate = (template: MobileTemplate): string => {
    if (!cliente) return template.mensagem;

    // Converter dados do mobile para o formato Cliente
    const clienteFormatado = {
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      servidor: cliente.servidor,
      status: cliente.status,
      dia_vencimento: cliente.dia_vencimento,
      valor_plano: cliente.valor_plano,
      // Campos obrigatórios com valores padrão
      created_at: new Date().toISOString(),
      user_id: '',
      aplicativo: '',
      usuario_aplicativo: '',
      senha_aplicativo: ''
    };

    // Usar a nova função que calcula corretamente os dados de vencimento
    return formatarMensagemWhatsAppComCliente(template.mensagem, clienteFormatado, allPayments);
  };

  return {
    cliente,
    templates,
    loading,
    buscarCliente,
    registrarAcao,
    formatarTemplate
  };
};
