
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface AddValueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (value: string | number) => void;
  activeTab: string;
  saving: boolean;
}

export const AddValueDialog = ({ isOpen, onOpenChange, onAdd, activeTab, saving }: AddValueDialogProps) => {
  const [newValue, setNewValue] = useState("");
  const [newNumericValue, setNewNumericValue] = useState("");

  const handleAdd = () => {
    if (["dias_vencimento"].includes(activeTab)) {
      if (newNumericValue) {
        onAdd(parseFloat(newNumericValue));
      }
    } else if (activeTab === "valores_plano") {
      if (newNumericValue) {
        onAdd(newNumericValue);
      }
    } else {
      if (newValue) {
        onAdd(newValue);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Valor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {["dias_vencimento"].includes(activeTab) ? (
            <div className="space-y-2">
              <label htmlFor="newNumericValue" className="text-sm font-medium">
                {activeTab === "dias_vencimento" ? "Dia de Vencimento" : ""}
              </label>
              <Input
                id="newNumericValue"
                type="number"
                step="1"
                min={activeTab === "dias_vencimento" ? "1" : "0"}
                max={activeTab === "dias_vencimento" ? "31" : undefined}
                value={newNumericValue}
                onChange={(e) => setNewNumericValue(e.target.value)}
                placeholder={activeTab === "dias_vencimento" ? "Ex: 10 (entre 1 e 31)" : ""}
              />
            </div>
          ) : activeTab === "valores_plano" ? (
            <div className="space-y-2">
              <label htmlFor="newNumericValue" className="text-sm font-medium">
                Valor do Plano
              </label>
              <Input
                id="newNumericValue"
                type="text"
                value={newNumericValue}
                onChange={(e) => setNewNumericValue(e.target.value)}
                placeholder="Ex: 49.9"
                maxLength={4}
              />
              <div className="text-xs text-gray-500 text-right mt-0.5">
                {newNumericValue?.length || 0}/4
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="newValue" className="text-sm font-medium">
                {activeTab === "ufs"
                  ? "UF"
                  : activeTab === "servidores"
                  ? "Servidor"
                  : activeTab === "dispositivos_smart"
                  ? "Dispositivo Smart"
                  : "Aplicativo"}
              </label>
              <Input
                id="newValue"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={activeTab === "ufs" ? "Digite a UF (máx. 2 caracteres)" : "Digite o valor (máx. 25 caracteres)"}
                maxLength={activeTab === "ufs" ? 2 : 25}
              />
              {activeTab !== "ufs" && (
                <div className="text-xs text-gray-500 text-right mt-0.5">
                  {newValue?.length || 0}/25
                </div>
              )}
              {activeTab === "ufs" && (
                <div className="text-xs text-gray-500 text-right mt-0.5">
                  {newValue?.length || 0}/2
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
