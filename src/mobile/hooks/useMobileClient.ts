
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

    // Converter dados do mobile para o formato Cliente completo
    const clienteFormatado = {
      id: cliente.id,
      nome: cliente.nome,
      telefone: cliente.telefone,
      codigo_pais_telefone: '+55', // Valor padrão
      uf: null, // Campo opcional
      servidor: cliente.servidor,
      status: cliente.status,
      dia_vencimento: cliente.dia_vencimento,
      valor_plano: cliente.valor_plano,
      dispositivo_smart: null, // Campo opcional
      aplicativo: cliente.aplicativo || '',
      usuario_aplicativo: cliente.usuario_aplicativo || '',
      senha_aplicativo: cliente.senha_aplicativo || '',
      data_licenca_aplicativo: null, // Campo opcional
      possui_tela_adicional: false, // Valor padrão
      dispositivo_smart_2: null, // Campo opcional
      aplicativo_2: null, // Campo opcional
      usuario_2: null, // Campo opcional
      senha_2: null, // Campo opcional
      data_licenca_2: null, // Campo opcional
      observacoes: null, // Campo opcional
      // Campos obrigatórios com valores padrão
      created_at: new Date().toISOString(),
      user_id: ''
    };

    // Usar a função que calcula corretamente os dados de vencimento
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
