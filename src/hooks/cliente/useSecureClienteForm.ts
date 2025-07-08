import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ClienteFormValues } from "./clienteFormSchema";
import { useSecureClienteOperations } from "./useSecureClienteOperations";
import { Cliente } from "@/types";

interface UseSecureClienteFormProps {
  clienteId?: string;
  initialData?: Cliente;
  mode: "create" | "edit";
}

export const useSecureClienteForm = ({ 
  clienteId, 
  initialData, 
  mode 
}: UseSecureClienteFormProps) => {
  const [realTimeValidation, setRealTimeValidation] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(null);
  
  const {
    loading: securityLoading,
    validationErrors,
    validationWarnings,
    validateCliente,
    createCliente,
    updateCliente,
    isDataValid,
    clearValidationMessages
  } = useSecureClienteOperations();

  // Configurar formulário com validação local + backend
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      telefone: initialData?.telefone || "",
      codigo_pais_telefone: initialData?.codigo_pais_telefone || "+55",
      uf: initialData?.uf || "",
      servidor: initialData?.servidor || "",
      dia_vencimento: initialData?.dia_vencimento || 1,
      valor_plano: initialData?.valor_plano?.toString() || "",
      dispositivo_smart: initialData?.dispositivo_smart || "",
      aplicativo: initialData?.aplicativo || "",
      usuario_aplicativo: initialData?.usuario_aplicativo || "",
      senha_aplicativo: initialData?.senha_aplicativo || "",
      data_licenca_aplicativo: initialData?.data_licenca_aplicativo || "",
      possui_tela_adicional: initialData?.possui_tela_adicional || false,
      dispositivo_smart_2: initialData?.dispositivo_smart_2 || "",
      aplicativo_2: initialData?.aplicativo_2 || "",
      usuario_2: initialData?.usuario_2 || "",
      senha_2: initialData?.senha_2 || "",
      data_licenca_2: initialData?.data_licenca_2 || "",
      observacoes: initialData?.observacoes || "",
      status: (initialData?.status as "ativo" | "inativo") || "inativo"
    }
  });

  // Converter dados do formulário para Cliente
  const convertFormToCliente = (data: ClienteFormValues): Partial<Cliente> => {
    return {
      ...data,
      valor_plano: data.valor_plano ? parseFloat(data.valor_plano) : undefined
    };
  };

  // Validação em tempo real (debounced)
  const performRealTimeValidation = async (data: ClienteFormValues) => {
    if (!realTimeValidation) return;
    
    try {
      await validateCliente(convertFormToCliente(data));
      setLastValidationTime(new Date());
    } catch (error) {
      console.error("Erro na validação em tempo real:", error);
    }
  };

  // Debounced validation
  useEffect(() => {
    if (!realTimeValidation) return;

    const subscription = form.watch((data) => {
      const timeoutId = setTimeout(() => {
        performRealTimeValidation(data as ClienteFormValues);
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [form, realTimeValidation]);

  // Submissão do formulário com validação de segurança
  const onSubmit = async (data: ClienteFormValues) => {
    try {
      // Limpar mensagens anteriores
      clearValidationMessages();
      
      // Converter e validar dados antes de submeter
      const clienteData = convertFormToCliente(data);
      const validation = await validateCliente(clienteData);
      
      if (!validation.valid) {
        // Os erros já foram definidos no hook useSecureClienteOperations
        return;
      }

      // Executar operação baseada no modo
      if (mode === "create") {
        await createCliente(clienteData);
      } else if (mode === "edit" && clienteId) {
        await updateCliente(clienteId, clienteData, initialData);
      }
    } catch (error) {
      console.error("Erro no submit do formulário:", error);
    }
  };

  // Verificar se o formulário está válido para submissão
  const isFormValid = () => {
    const formData = form.getValues();
    const clienteData = convertFormToCliente(formData);
    return (
      form.formState.isValid && 
      isDataValid(clienteData) && 
      validationErrors.length === 0
    );
  };

  // Obter status de segurança do formulário
  const getSecurityStatus = () => {
    const hasErrors = validationErrors.length > 0;
    const hasWarnings = validationWarnings.length > 0;
    
    return {
      isSecure: !hasErrors,
      hasErrors,
      hasWarnings,
      errors: validationErrors,
      warnings: validationWarnings,
      lastValidated: lastValidationTime
    };
  };

  // Habilitar/desabilitar validação em tempo real
  const toggleRealTimeValidation = (enabled: boolean) => {
    setRealTimeValidation(enabled);
    if (!enabled) {
      clearValidationMessages();
    }
  };

  // Força uma validação manual
  const forceValidation = async () => {
    const data = form.getValues();
    await performRealTimeValidation(data);
  };

  // Resetar formulário e validações
  const resetForm = () => {
    form.reset();
    clearValidationMessages();
    setLastValidationTime(null);
  };

  return {
    // Formulário React Hook Form
    form,
    
    // Funções de submissão
    onSubmit: form.handleSubmit(onSubmit),
    
    // Estados de loading
    isSubmitting: form.formState.isSubmitting || securityLoading,
    
    // Validação e segurança
    securityStatus: getSecurityStatus(),
    isFormValid: isFormValid(),
    
    // Controles de validação em tempo real
    realTimeValidation,
    toggleRealTimeValidation,
    forceValidation,
    
    // Utilitários
    resetForm,
    
    // Estados derivados
    isDirty: form.formState.isDirty,
    hasUnsavedChanges: form.formState.isDirty && !form.formState.isSubmitted
  };
};