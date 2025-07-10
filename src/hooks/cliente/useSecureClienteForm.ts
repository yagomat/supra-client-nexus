
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ClienteFormValues } from "./clienteFormSchema";
import { useSecureClienteOperations } from "./useSecureClienteOperations";
import { getDefaultValues, convertFormToCliente } from "./clienteFormUtils";
import { useRealTimeValidation } from "./clienteFormValidation";
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
    defaultValues: getDefaultValues(initialData, mode),
    mode: 'onChange'
  });

  // Atualizar os valores do formulário quando initialData mudar
  useEffect(() => {
    if (initialData && mode === "edit") {
      const newValues = getDefaultValues(initialData, mode);
      console.log("Atualizando valores do formulário:", newValues);
      form.reset(newValues);
    }
  }, [initialData, mode, form]);

  // Hook para validação em tempo real
  const { forceValidation } = useRealTimeValidation({
    form,
    validateCliente,
    enabled: realTimeValidation,
    setLastValidationTime
  });

  // Submissão do formulário com validação de segurança
  const onSubmit = async (data: ClienteFormValues | Partial<Cliente>) => {
    try {
      console.log("OnSubmit chamado com dados:", data);
      
      // Limpar mensagens anteriores
      clearValidationMessages();
      
      // Converter e validar dados antes de submeter
      const clienteData = 'nome' in data ? convertFormToCliente(data as ClienteFormValues) : data as Partial<Cliente>;
      
      console.log("Dados convertidos para envio:", clienteData);
      
      const validation = await validateCliente(clienteData);
      
      if (!validation.valid) {
        console.log("Validação falhou:", validation);
        return;
      }

      console.log("Validação passou, executando operação...");
      
      // Executar operação baseada no modo
      if (mode === "create") {
        console.log("Criando cliente...");
        await createCliente(clienteData as Omit<Cliente, "id" | "created_at" | "status">);
      } else if (mode === "edit" && clienteId) {
        console.log("Atualizando cliente...");
        await updateCliente(clienteId, clienteData);
      }
    } catch (error) {
      console.error("Erro no submit do formulário:", error);
    }
  };

  // Verificar se o formulário está válido para submissão
  function isFormValid() {
    return form.formState.isValid;
  }

  // Obter status de segurança do formulário
  function getSecurityStatus() {
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
  }

  // Habilitar/desabilitar validação em tempo real
  function toggleRealTimeValidation(enabled: boolean) {
    setRealTimeValidation(enabled);
    if (!enabled) {
      clearValidationMessages();
    }
  }

  // Resetar formulário e validações
  function resetForm() {
    form.reset(getDefaultValues(initialData, mode));
    clearValidationMessages();
    setLastValidationTime(null);
  }

  return {
    // Formulário React Hook Form
    form,
    
    // Funções de submissão
    onSubmit,
    
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
