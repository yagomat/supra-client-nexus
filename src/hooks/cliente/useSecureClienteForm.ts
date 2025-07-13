
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ClienteFormValues } from "./clienteFormSchema";
import { getDefaultValues, convertFormToCliente } from "./clienteFormUtils";
import { useSecureForm } from "@/hooks/useSecureForm";
import { Cliente } from "@/types";
import { SecureClienteService } from "@/services/secureClienteService";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Proteção CSRF integrada
  const {
    validateFormSecurity,
    getSecureFormHeaders,
    prepareSecureFormData,
    isSecure
  } = useSecureForm({
    validateOnChange: realTimeValidation,
    enforceRateLimit: true,
    logAttempts: true,
    onSecurityFail: () => {
      console.error('useSecureClienteForm: Falha na validação de segurança');
    }
  });

  // Configurar formulário com validação local
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

  // Submissão do formulário com validação de segurança CSRF
  const onSubmit = async (data: ClienteFormValues | Partial<Cliente>) => {
    try {
      console.log("OnSubmit chamado com dados:", data);
      
      // VALIDAÇÃO CSRF OBRIGATÓRIA
      const securityValid = await validateFormSecurity(data);
      if (!securityValid) {
        console.error('Validação CSRF falhou - operação cancelada');
        toast({
          title: "Erro de segurança",
          description: "Operação bloqueada por motivos de segurança.",
          variant: "destructive",
        });
        return;
      }

      // Converter dados se necessário
      const clienteData = 'nome' in data ? convertFormToCliente(data as ClienteFormValues) : data as Partial<Cliente>;
      
      // Preparar dados com informações de segurança
      const secureData = prepareSecureFormData(clienteData);
      
      console.log("Dados convertidos para envio (com CSRF):", secureData);
      
      // Executar operação baseada no modo
      if (mode === "create") {
        console.log("Criando cliente...");
        await SecureClienteService.createCliente(secureData as Omit<Cliente, "id" | "created_at" | "status">);
        toast({
          title: "Cliente criado com sucesso",
          description: "O cliente foi criado e salvo no sistema.",
        });
        navigate("/clientes");
      } else if (mode === "edit" && clienteId) {
        console.log("Atualizando cliente...");
        await SecureClienteService.updateCliente(clienteId, secureData);
        toast({
          title: "Cliente atualizado com sucesso",
          description: "As informações do cliente foram atualizadas.",
        });
        navigate("/clientes");
      }
    } catch (error) {
      console.error("Erro no submit do formulário:", error);
      toast({
        title: "Erro na operação",
        description: "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Verificar se o formulário está válido para submissão
  function isFormValid() {
    return form.formState.isValid && isSecure;
  }

  // Obter status de segurança do formulário
  function getSecurityStatus() {
    return {
      isSecure: isSecure,
      csrfProtected: isSecure,
      hasErrors: false,
      hasWarnings: false,
      errors: [],
      warnings: [],
      lastValidated: lastValidationTime
    };
  }

  // Habilitar/desabilitar validação em tempo real
  function toggleRealTimeValidation(enabled: boolean) {
    setRealTimeValidation(enabled);
  }

  // Resetar formulário e validações
  function resetForm() {
    form.reset(getDefaultValues(initialData, mode));
    setLastValidationTime(null);
  }

  // Forçar validação manual
  function forceValidation() {
    form.trigger();
    setLastValidationTime(new Date());
  }

  return {
    // Formulário React Hook Form
    form,
    
    // Funções de submissão
    onSubmit,
    
    // Estados de loading
    isSubmitting: form.formState.isSubmitting,
    
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
