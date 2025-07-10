
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ExcelButtonsInfo = () => {
  return (
    <div className="flex items-center justify-between lg:justify-start lg:gap-2 w-full text-sm text-muted-foreground">
      <span className="flex-1 lg:flex-initial text-justify lg:text-left pr-2 lg:pr-0">Informações sobre exportação / Importação</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
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
  );
};
