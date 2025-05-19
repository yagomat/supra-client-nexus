
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Import, FileUp, Loader2 } from "lucide-react";
import { Cliente } from "@/types";
import { exportClientesToExcel, importClientesFromExcel } from "@/services/clienteExcelService";

interface ClienteExcelButtonsProps {
  clientes: Cliente[];
  onImportSuccess: () => void;
}

export const ClienteExcelButtons = ({ clientes, onImportSuccess }: ClienteExcelButtonsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleExport = async () => {
    if (clientes.length === 0) {
      toast({
        title: "Nenhum cliente para exportar",
        description: "Não há clientes disponíveis para exportação.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExporting(true);
      await exportClientesToExcel(clientes);
      toast({
        title: "Exportação concluída",
        description: `${clientes.length} clientes exportados com sucesso.`,
      });
    } catch (error) {
      console.error("Erro na exportação:", error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os clientes.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    // Simular clique no input de arquivo oculto
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
          description: `${result.imported} clientes importados com sucesso.${
            result.errors.length > 0 ? ` ${result.errors.length} erros encontrados.` : ""
          }`,
        });
        
        // Notificar o componente pai para atualizar a lista
        onImportSuccess();
      } else {
        toast({
          title: "Falha na importação",
          description: `Nenhum cliente importado. ${result.errors.length} erros encontrados.`,
          variant: "destructive",
        });
      }
      
      // Se houver erros, mostrar detalhes no console
      if (result.errors.length > 0) {
        console.error("Erros na importação:", result.errors);
      }
    } catch (error) {
      console.error("Erro na importação:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os clientes. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (event.target) {
        event.target.value = "";
      }
      setIsImporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isExporting || clientes.length === 0}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4 mr-2" />
        )}
        Exportar para Excel
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={isImporting}
      >
        {isImporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Import className="h-4 w-4 mr-2" />
        )}
        Importar de Excel
      </Button>
      
      {/* Input de arquivo oculto */}
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
    </div>
  );
};
