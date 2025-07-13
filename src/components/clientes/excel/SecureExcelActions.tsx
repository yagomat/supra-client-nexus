
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileUp, Loader2, Shield } from "lucide-react";
import { secureExportClientesToExcel } from "@/services/clienteExcel/secureExportService";

interface SecureExcelActionsProps {
  clientesCount: number;
}

export const SecureExcelActions = ({ clientesCount }: SecureExcelActionsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleSecureExport = async () => {
    if (clientesCount === 0) {
      toast({
        title: "Nenhum cliente para exportar",
        description: "Não há clientes disponíveis para exportação.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsExporting(true);
      
      console.log('Iniciando exportação segura...');
      const result = await secureExportClientesToExcel();
      
      if (result.success) {
        toast({
          title: "Exportação segura concluída",
          description: `${result.count} clientes exportados com senhas protegidas.`,
        });
      } else {
        toast({
          title: "Erro na exportação",
          description: result.error || "Erro desconhecido na exportação.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro na exportação segura:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os clientes de forma segura.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full lg:justify-start">
      <Button 
        variant="outline" 
        onClick={handleSecureExport} 
        disabled={isExporting || clientesCount === 0} 
        size="sm" 
        className="flex-1 lg:flex-initial lg:w-auto px-3"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Shield className="h-4 w-4 mr-2" />
        )}
        {isExporting ? 'Exportando...' : 'Exportar Seguro'}
      </Button>
      
      <div className="text-xs text-muted-foreground flex items-center">
        <Shield className="h-3 w-3 mr-1" />
        <span>Senhas protegidas</span>
      </div>
    </div>
  );
};
