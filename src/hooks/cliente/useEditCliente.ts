
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSecureClienteForm } from "@/hooks/cliente/useSecureClienteForm";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { SecureClienteService } from "@/services/secureClienteService";
import { ValoresPredefinidos, Cliente } from "@/types";
import { ClienteFormValues } from "@/hooks/cliente/clienteFormSchema";

export const useEditCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);
  
  useEffect(() => {
    if (!id) {
      navigate("/clientes");
    }
  }, [id, navigate]);

  // Carregar dados do cliente e valores predefinidos
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [clienteData, valoresData] = await Promise.all([
          SecureClienteService.getClienteWithDecryptedData(id),
          getValoresPredefinidos()
        ]);
        
        console.log("Dados do cliente carregados:", clienteData);
        setCliente(clienteData);
        setValoresPredefinidos(valoresData);
        setPossuiTelaAdicional(clienteData.possui_tela_adicional || false);
      } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do cliente",
          variant: "destructive",
        });
        navigate("/clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast, navigate]);

  // Usar o hook seguro para edição de cliente
  const {
    form,
    onSubmit: originalOnSubmit,
    isSubmitting,
    isFormValid
  } = useSecureClienteForm({ 
    clienteId: id,
    initialData: cliente || undefined,
    mode: "edit"
  });

  // Preencher o formulário quando os dados do cliente forem carregados
  useEffect(() => {
    if (cliente && form) {
      console.log("Preenchendo formulário com dados do cliente:", cliente);
      
      form.reset({
        nome: cliente.nome || "",
        telefone: cliente.telefone || "",
        codigo_pais_telefone: cliente.codigo_pais_telefone || "+55",
        uf: cliente.uf || "",
        servidor: cliente.servidor || "",
        dia_vencimento: cliente.dia_vencimento || 1,
        valor_plano: cliente.valor_plano?.toString() || "",
        dispositivo_smart: cliente.dispositivo_smart || "",
        aplicativo: cliente.aplicativo || "",
        usuario_aplicativo: cliente.usuario_aplicativo || "",
        senha_aplicativo: cliente.senha_aplicativo || "",
        data_licenca_aplicativo: cliente.data_licenca_aplicativo || "",
        possui_tela_adicional: cliente.possui_tela_adicional || false,
        dispositivo_smart_2: cliente.dispositivo_smart_2 || "",
        aplicativo_2: cliente.aplicativo_2 || "",
        usuario_2: cliente.usuario_2 || "",
        senha_2: cliente.senha_2 || "",
        data_licenca_2: cliente.data_licenca_2 || "",
        observacoes: cliente.observacoes || "",
        status: (cliente.status as "ativo" | "inativo") || "inativo"
      });
    }
  }, [cliente, form]);

  // Sincronizar switch de tela adicional com formulário
  useEffect(() => {
    if (form) {
      form.setValue("possui_tela_adicional", possuiTelaAdicional);
    }
  }, [possuiTelaAdicional, form]);

  // Função para lidar com o submit do formulário
  const handleFormSubmit = async (data: ClienteFormValues) => {
    console.log("Dados do formulário antes da validação:", data);
    
    const requiredFields = [
      { field: 'nome', name: 'Nome' },
      { field: 'servidor', name: 'Servidor' },
      { field: 'aplicativo', name: 'Aplicativo' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !data[field as keyof ClienteFormValues]);

    if (missingFields.length > 0) {
      missingFields.forEach(({ field }) => {
        form.setError(field as any, {
          type: 'required',
          message: 'Este campo é obrigatório'
        });
      });

      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Por favor, preencha: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Preparar dados para atualização - garantir que os campos não sejam undefined
    const updateData: Partial<Cliente> = {
      nome: data.nome,
      telefone: data.telefone?.trim() || null,
      codigo_pais_telefone: data.codigo_pais_telefone || "+55",
      uf: data.uf?.trim() || null,
      servidor: data.servidor,
      dia_vencimento: data.dia_vencimento,
      valor_plano: data.valor_plano?.trim() ? Number(data.valor_plano) : null,
      dispositivo_smart: data.dispositivo_smart?.trim() || null,
      aplicativo: data.aplicativo,
      usuario_aplicativo: data.usuario_aplicativo?.trim() || null,
      senha_aplicativo: data.senha_aplicativo?.trim() || null,
      data_licenca_aplicativo: data.data_licenca_aplicativo?.trim() || null,
      possui_tela_adicional: data.possui_tela_adicional || false,
      dispositivo_smart_2: data.possui_tela_adicional ? (data.dispositivo_smart_2?.trim() || null) : null,
      aplicativo_2: data.possui_tela_adicional ? (data.aplicativo_2?.trim() || null) : null,
      usuario_2: data.possui_tela_adicional ? (data.usuario_2?.trim() || null) : null,
      senha_2: data.possui_tela_adicional ? (data.senha_2?.trim() || null) : null,
      data_licenca_2: data.possui_tela_adicional ? (data.data_licenca_2?.trim() || null) : null,
      observacoes: data.observacoes?.trim() || null,
      status: data.status || "inativo"
    };

    console.log("Dados preparados para atualização:", updateData);

    try {
      await SecureClienteService.updateCliente(id!, updateData);
      
      toast({
        title: "Cliente atualizado com sucesso",
        description: "As informações do cliente foram atualizadas.",
      });
      
      navigate("/clientes");
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    loading,
    cliente,
    valoresPredefinidos,
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    form,
    handleFormSubmit,
    isSubmitting,
    isFormValid,
    navigate
  };
};
