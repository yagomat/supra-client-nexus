
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
      data_licenca_aplicativo: data.data_licenca_aplicativo === "" ? null : data.data_licenca_aplicativo,
      data_licenca_2: data.data_licenca_2 === "" ? null : data.data_licenca_2,
    };

    console.log("Dados sanitizados:", sanitizedData);

    // Submeter usando o método correto do formulário
    form.setValue("data_licenca_aplicativo", sanitizedData.data_licenca_aplicativo || "");
    form.setValue("data_licenca_2", sanitizedData.data_licenca_2 || "");
    
    // Chamar o onSubmit que já está preparado para ser usado como handler
    const formEvent = new Event('submit') as any;
    await originalOnSubmit(formEvent);
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
