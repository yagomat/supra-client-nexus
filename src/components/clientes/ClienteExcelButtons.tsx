
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Import, FileUp, Loader2 } from "lucide-react";
import { Cliente } from "@/types";
import { exportClientesToExcel, importClientesFromExcel } from "@/services/clienteExcel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClienteExcelButtonsProps {
  clientes: Cliente[];
  onImportSuccess: () => void;
}

export const ClienteExcelButtons = ({ clientes, onImportSuccess }: ClienteExcelButtonsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImportErrors([]);
      const result = await importClientesFromExcel(file);
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${result.imported} clientes importados com sucesso.${
            result.errors.length > 0 ? ` Alguns registros não foram importados.` : ""
          }`,
        });
        
        // Notificar o componente pai para atualizar a lista
        onImportSuccess();
        
        // Se houver erros, mostrar no diálogo
        if (result.errors.length > 0) {
          setImportErrors(result.errors);
          setShowErrorDialog(true);
        }
      } else {
        toast({
          title: "Falha na importação",
          description: "Nenhum cliente importado. Verifique os erros para mais detalhes.",
          variant: "destructive",
        });
        
        setImportErrors(result.errors);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Erro na importação:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os clientes.",
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
    <>
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
          Exportar Excel
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
          Importar Excel
        </Button>
        
        {/* Input de arquivo oculto - aceita apenas arquivos Excel */}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {/* Diálogo de erros de importação */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Erros na importação</DialogTitle>
            <DialogDescription>
              Alguns clientes não puderam ser importados pelos seguintes motivos:
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px] mt-2">
            <ul className="list-disc pl-6 space-y-2">
              {importErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">{error}</li>
              ))}
            </ul>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
