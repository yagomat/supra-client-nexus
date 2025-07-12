
import { ClientePasswordService } from "@/services/clientePasswordService";
import { useToast } from "@/components/ui/use-toast";

/**
 * Utilitários para migração de senhas de clientes
 */
export const passwordMigrationUtils = {
  /**
   * Executa a migração de senhas existentes
   * Deve ser executado apenas por administradores
   */
  async executeMigration(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const result = await ClientePasswordService.migrateExistingPasswords();
      
      if (result.success) {
        return {
          success: true,
          message: `Migração concluída com sucesso! ${result.total_migradas} senhas foram criptografadas.`,
          details: {
            senhasAplicativo: result.senhas_aplicativo_migradas,
            senhas2: result.senhas_2_migradas,
            total: result.total_migradas,
            erros: result.errors
          }
        };
      } else {
        return {
          success: false,
          message: "Falha na migração de senhas.",
          details: result
        };
      }
    } catch (error: any) {
      console.error("Erro na migração de senhas:", error);
      
      if (error.message?.includes('Apenas administradores')) {
        return {
          success: false,
          message: "Acesso negado. Apenas administradores podem executar a migração de senhas."
        };
      }
      
      return {
        success: false,
        message: `Erro durante a migração: ${error.message || 'Erro desconhecido'}`
      };
    }
  },

  /**
   * Hook para usar a migração de senhas com toast
   */
  useMigration() {
    const { toast } = useToast();

    const executeMigration = async () => {
      const result = await this.executeMigration();
      
      toast({
        title: result.success ? "Migração Concluída" : "Erro na Migração",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      if (result.success && result.details?.erros?.length > 0) {
        console.warn("Erros durante a migração:", result.details.erros);
      }

      return result;
    };

    return { executeMigration };
  }
};
