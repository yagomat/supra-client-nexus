
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useSecureClienteForm } from "./useSecureClienteForm";
import { ClienteFormValues } from "./clienteFormSchema";

export const useCadastrarClienteForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);

  const {
    form,
    onSubmit: originalOnSubmit,
    isSubmitting,
    securityStatus,
    realTimeValidation,
    toggleRealTimeValidation
  } = useSecureClienteForm({ 
    mode: "create"
  });

  // Sincronizar switch de tela adicional com formulário
  useEffect(() => {
    form.setValue("possui_tela_adicional", possuiTelaAdicional);
  }, [possuiTelaAdicional, form]);

  // Função personalizada para validar e processar dados antes da submissão
  const handleFormSubmission = async (data: ClienteFormValues) => {
    console.log("Dados do formulário antes da validação:", data);
    
    const requiredFields = [
      { field: 'nome', name: 'Nome' },
      { field: 'servidor', name: 'Servidor' },
      { field: 'aplicativo', name: 'Aplicativo' },
      { field: 'usuario_aplicativo', name: 'Usuário (MAC)' },
      { field: 'senha_aplicativo', name: 'Senha (Id)' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !data[field as keyof ClienteFormValues]);

    if (missingFields.length > 0) {
      // Destacar campos obrigatórios
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

    // Tratar campos de data - converter strings vazias para null
    const sanitizedData = {
      ...data,
      data_licenca_aplicativo: data.data_licenca_aplicativo?.trim() === "" ? null : data.data_licenca_aplicativo,
      data_licenca_2: data.data_licenca_2?.trim() === "" ? null : data.data_licenca_2,
      // Garantir que campos opcionais não sejam strings vazias
      telefone: data.telefone?.trim() === "" ? null : data.telefone,
      uf: data.uf?.trim() === "" ? null : data.uf,
      valor_plano: data.valor_plano?.trim() === "" ? null : data.valor_plano,
      dispositivo_smart: data.dispositivo_smart?.trim() === "" ? null : data.dispositivo_smart,
      dispositivo_smart_2: data.dispositivo_smart_2?.trim() === "" ? null : data.dispositivo_smart_2,
      aplicativo_2: data.aplicativo_2?.trim() === "" ? null : data.aplicativo_2,
      usuario_2: data.usuario_2?.trim() === "" ? null : data.usuario_2,
      senha_2: data.senha_2?.trim() === "" ? null : data.senha_2,
      observacoes: data.observacoes?.trim() === "" ? null : data.observacoes
    };

    console.log("Dados sanitizados:", sanitizedData);

    // Submeter usando o método seguro do hook
    try {
      await originalOnSubmit(sanitizedData);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate("/clientes");
  };

  return {
    form,
    onSubmit: form.handleSubmit(handleFormSubmission),
    isSubmitting,
    securityStatus,
    realTimeValidation,
    toggleRealTimeValidation,
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    handleCancel
  };
};
