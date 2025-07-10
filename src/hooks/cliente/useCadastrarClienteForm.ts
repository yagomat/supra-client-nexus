
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

  // Submeter diretamente os dados processados - o useSecureClienteForm já faz a sanitização
  try {
    console.log("Chamando originalOnSubmit com dados:", data);
    await originalOnSubmit(data);
    
    // Sucesso - mostrar mensagem e redirecionar
    toast({
      title: "Cliente cadastrado com sucesso",
      description: "O cliente foi cadastrado e está disponível na lista.",
    });
    
    navigate("/clientes");
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
