import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Import, FileUp, Loader2, Info } from "lucide-react";
import { Cliente } from "@/types";
import { exportClientesToExcel, importClientesFromExcel } from "@/services/clienteExcel";
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
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const {
    toast
  } = useToast();
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
          description: `${result.imported} clientes importados com sucesso.${result.errors.length > 0 ? ` Alguns registros não foram importados.` : ""}`
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
          variant: "destructive"
        });
        setImportErrors(result.errors);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Erro na importação:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar os clientes.",
        variant: "destructive"
      });
    } finally {
      // Limpar o input de arquivo para permitir selecionar o mesmo arquivo novamente
      if (event.target) {
        event.target.value = "";
      }
      setIsImporting(false);
    }
  };

  return <>
      <div className="flex flex-col gap-2">
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
          
          {/* Input de arquivo oculto - aceita Excel e ODS */}
          <input type="file" accept=".xlsx,.xls,.ods" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
        </div>

        {/* Informações sobre importação/exportação */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Informações sobre exportação / Importação</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
              <div className="space-y-3 text-justify">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Importação de Clientes</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Para importar clientes, o arquivo Excel deve conter as colunas na seguinte ordem:
                  </p>
                </div>
                <ScrollArea className="h-48">
                  <div className="space-y-1 text-xs">
                    <div className="grid grid-cols-2 gap-2 font-medium">
                      <span>Coluna</span>
                      <span>Campo</span>
                    </div>
                    <hr className="my-2" />
                    <div className="grid grid-cols-2 gap-2"><span>A</span><span>Data de cadastro</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>B</span><span>Nome</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>C</span><span>Telefone</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>D</span><span>UF</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>E</span><span>Servidor</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>F</span><span>Dia de Vencimento</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>G</span><span>Plano</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>H</span><span>Dispositivo smart</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>I</span><span>Aplicativo</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>J</span><span>Usuário</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>K</span><span>Senha</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>L</span><span>Vencimento da licença do app</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>M</span><span>Dispositivo smart 2</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>N</span><span>Aplicativo 2</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>O</span><span>Usuário 2</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>P</span><span>Senha 2</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>Q</span><span>Vencimento da licença do app 2</span></div>
                    <div className="grid grid-cols-2 gap-2"><span>R</span><span>Observações</span></div>
                  </div>
                </ScrollArea>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Dica:</strong> Exporte um arquivo para ver o formato correto.</p>
                  <p><strong>Importante:</strong> A primeira linha deve conter os cabeçalhos das colunas.</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
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
              {importErrors.map((error, index) => <li key={index} className="text-sm text-red-600">{error}</li>)}
            </ul>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
};
