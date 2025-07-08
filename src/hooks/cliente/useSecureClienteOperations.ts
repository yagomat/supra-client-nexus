import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ClienteSecurityService } from "@/services/clienteSecurityService";
import { Cliente } from "@/types";

export const useSecureClienteOperations = () => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Valida dados do cliente usando validação de segurança do backend
   */
  const validateCliente = async (data: Partial<Cliente>) => {
    try {
      setLoading(true);
      setValidationErrors([]);
      setValidationWarnings([]);

      const result = await ClienteSecurityService.validateClienteData(data);
      
      setValidationErrors(result.errors || []);
      setValidationWarnings(result.warnings || []);
      
      // Mostrar warnings como toast informativo
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          toast({
            title: "Atenção",
            description: warning,
            variant: "default",
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error("Erro na validação:", error);
      const errorMessage = "Erro ao validar dados do cliente";
      setValidationErrors([errorMessage]);
      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
        sanitized_data: {}
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria um novo cliente com validação de segurança
   */
  const createCliente = async (data: Partial<Cliente>) => {
    try {
      setLoading(true);
      setValidationErrors([]);
      setValidationWarnings([]);

      // Validar dados primeiro
      const validation = await validateCliente(data);
      
      if (!validation.valid) {
        toast({
          title: "Dados inválidos",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        return { success: false, validation };
      }

      // Criar cliente com segurança
      const result = await ClienteSecurityService.secureCreateCliente(data);
      
      if (result.success) {
        toast({
          title: "Cliente criado com sucesso",
          description: "O cliente foi cadastrado com todas as validações de segurança.",
        });
        
        // Log da operação
        await ClienteSecurityService.logOperation(
          'create_success',
          result.cliente?.id,
          null,
          ClienteSecurityService.sanitizeClienteForDisplay(result.cliente!)
        );
        
        // Navegar para lista de clientes
        navigate("/clientes");
        
        return { success: true, cliente: result.cliente };
      } else {
        // Mostrar erros de validação ou operação
        const errorMessage = result.error || "Erro desconhecido";
        
        if (result.validation && !result.validation.valid) {
          setValidationErrors(result.validation.errors);
          setValidationWarnings(result.validation.warnings || []);
        }
        
        toast({
          title: "Erro ao criar cliente",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage, validation: result.validation };
      }
    } catch (error) {
      console.error("Erro na criação do cliente:", error);
      const errorMessage = "Erro interno do servidor";
      
      toast({
        title: "Erro ao criar cliente",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza um cliente existente com validação de segurança
   */
  const updateCliente = async (clienteId: string, data: Partial<Cliente>, originalData?: Cliente) => {
    try {
      setLoading(true);
      setValidationErrors([]);
      setValidationWarnings([]);

      // Validar dados primeiro
      const validation = await validateCliente(data);
      
      if (!validation.valid) {
        toast({
          title: "Dados inválidos",
          description: validation.errors.join(", "),
          variant: "destructive",
        });
        return { success: false, validation };
      }

      // Atualizar cliente com segurança
      const result = await ClienteSecurityService.secureUpdateCliente(clienteId, data);
      
      if (result.success) {
        toast({
          title: "Cliente atualizado com sucesso",
          description: "Os dados foram atualizados com todas as validações de segurança.",
        });
        
        // Log da operação
        await ClienteSecurityService.logOperation(
          'update_success',
          clienteId,
          originalData ? ClienteSecurityService.sanitizeClienteForDisplay(originalData) : null,
          ClienteSecurityService.sanitizeClienteForDisplay(result.cliente!)
        );
        
        // Navegar para lista de clientes
        navigate("/clientes");
        
        return { success: true, cliente: result.cliente };
      } else {
        // Mostrar erros de validação ou operação
        const errorMessage = result.error || "Erro desconhecido";
        
        if (result.validation && !result.validation.valid) {
          setValidationErrors(result.validation.errors);
          setValidationWarnings(result.validation.warnings || []);
        }
        
        toast({
          title: "Erro ao atualizar cliente",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { success: false, error: errorMessage, validation: result.validation };
      }
    } catch (error) {
      console.error("Erro na atualização do cliente:", error);
      const errorMessage = "Erro interno do servidor";
      
      toast({
        title: "Erro ao atualizar cliente",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtém logs de auditoria das operações do usuário
   */
  const getAuditLogs = async (eventType?: string) => {
    try {
      const logs = await ClienteSecurityService.getAuditLogs(eventType);
      return logs;
    } catch (error) {
      console.error("Erro ao buscar logs de auditoria:", error);
      return [];
    }
  };

  /**
   * Verifica se os dados do cliente são válidos para operações críticas
   */
  const isDataValid = (data: Partial<Cliente>): boolean => {
    return ClienteSecurityService.isClienteDataValid(data);
  };

  /**
   * Limpa erros e warnings de validação
   */
  const clearValidationMessages = () => {
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  return {
    loading,
    validationErrors,
    validationWarnings,
    validateCliente,
    createCliente,
    updateCliente,
    getAuditLogs,
    isDataValid,
    clearValidationMessages
  };
};