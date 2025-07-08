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

  // Converter dados do formulário para Cliente com sanitização adequada
  const convertFormToCliente = (data: ClienteFormValues): Partial<Cliente> => {
    console.log("Convertendo dados do formulário:", data);
    
    // Função helper para sanitizar strings
    const sanitizeString = (value: string | undefined | null) => {
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return null;
      }
      return value.trim();
    };

    // Função helper para sanitizar números
    const sanitizeNumber = (value: string | number | undefined | null) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
      }
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      }
      return value;
    };

    const cleanData = {
      nome: data.nome, // obrigatório
      servidor: data.servidor, // obrigatório
      dia_vencimento: data.dia_vencimento, // obrigatório
      aplicativo: data.aplicativo, // obrigatório
      usuario_aplicativo: data.usuario_aplicativo, // obrigatório
      senha_aplicativo: data.senha_aplicativo, // obrigatório
      codigo_pais_telefone: data.codigo_pais_telefone || "+55",
      possui_tela_adicional: data.possui_tela_adicional || false,
      status: data.status || "inativo",
      // Campos opcionais sanitizados
      telefone: sanitizeString(data.telefone),
      uf: sanitizeString(data.uf),
      valor_plano: sanitizeNumber(data.valor_plano),
      dispositivo_smart: sanitizeString(data.dispositivo_smart),
      data_licenca_aplicativo: sanitizeString(data.data_licenca_aplicativo),
      dispositivo_smart_2: sanitizeString(data.dispositivo_smart_2),
      aplicativo_2: sanitizeString(data.aplicativo_2),
      usuario_2: sanitizeString(data.usuario_2),
      senha_2: sanitizeString(data.senha_2),
      data_licenca_2: sanitizeString(data.data_licenca_2),
      observacoes: sanitizeString(data.observacoes)
    };

    console.log("Dados limpos:", cleanData);
    return cleanData;
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
        await createCliente(clienteData);
      } else if (mode === "edit" && clienteId) {
        console.log("Atualizando cliente...");
        await updateCliente(clienteId, clienteData, initialData);
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

  // Força uma validação manual
  async function forceValidation() {
    const data = form.getValues();
    await performRealTimeValidation(data);
  }

  // Resetar formulário e validações
  function resetForm() {
    form.reset();
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
