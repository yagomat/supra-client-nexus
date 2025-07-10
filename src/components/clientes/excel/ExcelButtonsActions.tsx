
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Import, FileUp, Loader2 } from "lucide-react";
import { Cliente } from "@/types";
import { exportClientesToExcel, importClientesFromExcel } from "@/services/clienteExcel";

interface ExcelButtonsActionsProps {
  clientes: Cliente[];
  onImportSuccess: () => void;
  onImportErrors: (errors: string[]) => void;
}

export const ExcelButtonsActions = ({
  clientes,
  onImportSuccess,
  onImportErrors
}: ExcelButtonsActionsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (clientes.length === 0) {
      toast({
        title: "Nenhum cliente para exportar",
        description: "Não há clientes disponíveis para exportação.",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsExporting(true);
      await exportClientesToExcel(clientes);
      toast({
        title: "Exportação concluída",
        description: `${clientes.length} clientes exportados com sucesso.`
      });
    } catch (error) {
      console.error("Erro na exportação:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os clientes.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setIsImporting(true);
      const result = await importClientesFromExcel(file);
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.imported} clientes importados com sucesso.${result.errors.length > 0 ? ` Alguns registros não foram importados.` : ""}`
        });

        onImportSuccess();

        if (result.errors.length > 0) {
          onImportErrors(result.errors);
        }
      } else {
        toast({
          title: "Falha na importação",
          description: "Nenhum cliente importado. Verifique os erros para mais detalhes.",
          variant: "destructive"
        });
        onImportErrors(result.errors);
      }
    } catch (error) {
      console.error("Erro na importação:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os clientes.",
        variant: "destructive"
      });
    } finally {
      if (event.target) {
        event.target.value = "";
      }
      setIsImporting(false);
    }
  };

  return (
    <div className="flex gap-2 w-full lg:justify-start">
      <Button 
        variant="outline" 
        onClick={handleExport} 
        disabled={isExporting || clientes.length === 0} 
        size="sm" 
        className="flex-1 lg:flex-initial lg:w-auto px-3"
      >
        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileUp className="h-4 w-4 mr-2" />}
        Exportar Excel
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleImportClick} 
        disabled={isImporting} 
        size="sm" 
        className="flex-1 lg:flex-initial lg:w-auto px-3"
      >
        {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Import className="h-4 w-4 mr-2" />}
        Importar Excel
      </Button>
      
      <input 
        type="file" 
        accept=".xlsx,.xls,.ods" 
        onChange={handleFileChange} 
        ref={fileInputRef} 
        className="hidden" 
      />
    </div>
  );
};
