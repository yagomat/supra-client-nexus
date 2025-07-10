import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Import, Loader2, Info } from "lucide-react";
import { Cliente } from "@/types";
import { exportClientesToExcel, importClientesFromExcel } from "@/services/clienteExcel";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ClienteExcelButtonsProps {
  clientes: Cliente[];
  onImportSuccess: () => void;
}

export const ClienteExcelButtons = ({
  clientes,
  onImportSuccess
}: ClienteExcelButtonsProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: Cliente[];
    errors: { row: number; error: string }[];
  } | null>(null);
  const {
    toast
  } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportClientesToExcel(clientes);
      toast({
        title: "Clientes exportados",
        description: "A planilha Excel foi gerada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Houve um erro ao gerar a planilha Excel.",
        variant: "destructive",
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
    setIsImporting(true);
    setImportResults(null);
    const file = event.target.files?.[0];

    if (!file) {
      setIsImporting(false);
      return;
    }

    try {
      const { success, errors } = await importClientesFromExcel(file);
      setImportResults({
        success,
        errors
      });

      if (success.length > 0) {
        toast({
          title: "Clientes importados",
          description: `${success.length} clientes foram importados com sucesso.`,
        });
        onImportSuccess();
      }

      if (errors.length > 0) {
        toast({
          title: "Erro na importação",
          description: `${errors.length} linhas contém erros. Verifique os detalhes abaixo.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao importar",
        description: error.message || "Houve um erro ao processar o arquivo Excel.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return <>
      <div className="flex flex-col gap-2">
        <div className="flex justify-start gap-2 sm:col-span-2">
          <Button 
            variant="outline" 
            onClick={handleExport} 
            disabled={isExporting || clientes.length === 0} 
            size="sm"
            className="w-auto px-3"
          >
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileUp className="h-4 w-4 mr-2" />}
            Exportar Excel
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleImportClick} 
            disabled={isImporting} 
            size="sm"
            className="w-auto px-3"
          >
            {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Import className="h-4 w-4 mr-2" />}
            Importar Excel
          </Button>
          
          {/* Input de arquivo oculto - aceita Excel e ODS */}
          <input 
            type="file" 
            accept=".xlsx,.xls,.ods" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            className="hidden" 
          />
        </div>

        {/* Informações sobre importação/exportação */}
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-2 text-justify">
                <p className="text-sm font-medium">Exportação:</p>
                <p className="text-xs text-muted-foreground">
                  Baixa todos os clientes em formato Excel (.xlsx) com todas as informações cadastradas.
                </p>
                
                <p className="text-sm font-medium">Importação:</p>
                <p className="text-xs text-muted-foreground">
                  Aceita arquivos Excel (.xlsx, .xls) e OpenDocument (.ods). O arquivo deve conter as colunas: Nome, Telefone, UF, Servidor, Dia Vencimento, Valor Plano, Aplicativo, Usuário Aplicativo, Senha Aplicativo, Status.
                </p>
                
                <p className="text-xs text-muted-foreground">
                  Campos opcionais: Dispositivo Smart, Data Licença Aplicativo, Possui Tela Adicional, Observações.
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">Informações sobre importação/exportação</span>
        </div>
      </div>

      <Dialog open={importResults !== null} onOpenChange={() => setImportResults(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resultados da Importação</DialogTitle>
            <DialogDescription>
              {importResults?.success.length} clientes importados com sucesso.
              {importResults?.errors.length > 0 && (
                <>
                  <br />
                  {importResults.errors.length} erros encontrados.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {importResults?.errors.length > 0 && (
            <ScrollArea className="h-64">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left font-medium px-2 py-1">Linha</th>
                    <th className="text-left font-medium px-2 py-1">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.errors.map((error, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-2 py-1">{error.row}</td>
                      <td className="px-2 py-1">{error.error}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button onClick={() => setImportResults(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};
