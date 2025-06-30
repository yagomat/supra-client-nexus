
import { useState, useEffect } from 'react';
import { mobileApiService, MobileClienteInfo, MobileTemplate } from '../services/mobileApiService';
import { useWhatsAppDetection } from './useWhatsAppDetection';

export const useMobileClient = () => {
  const [cliente, setCliente] = useState<MobileClienteInfo | null>(null);
  const [templates, setTemplates] = useState<MobileTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentContact } = useWhatsAppDetection();

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

    return template.mensagem
      .replace('{{nome}}', cliente.nome)
      .replace('{{dia_vencimento}}', cliente.dia_vencimento.toString())
      .replace('{{valor_plano}}', cliente.valor_plano?.toFixed(2) || '0.00')
      .replace('{{servidor}}', cliente.servidor);
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
