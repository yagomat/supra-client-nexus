
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AddValueDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (value: string | number, tabType: string) => Promise<boolean>;
  activeTab: string;
  saving: boolean;
}

const tabOptions = [
  { value: "ufs", label: "UF" },
  { value: "servidores", label: "Servidores" },
  { value: "dias_vencimento", label: "Dias de Vencimento" },
  { value: "valores_plano", label: "Valores de Plano" },
  { value: "dispositivos_smart", label: "Dispositivos Smart" },
  { value: "aplicativos", label: "Aplicativos" }
];

export const AddValueDialog = ({ isOpen, onOpenChange, onAdd, activeTab, saving }: AddValueDialogProps) => {
  const [newValue, setNewValue] = useState("");
  const [newNumericValue, setNewNumericValue] = useState("");
  const [selectedTab, setSelectedTab] = useState(activeTab);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setNewValue("");
      setNewNumericValue("");
      setSelectedTab(activeTab);
    }
    onOpenChange(open);
  };

  const handleAdd = async () => {
    let valueToAdd: string | number;
    
    if (["dias_vencimento"].includes(selectedTab)) {
      if (!newNumericValue || isNaN(Number(newNumericValue))) {
        return;
      }
      valueToAdd = parseInt(newNumericValue);
    } else if (selectedTab === "valores_plano") {
      if (!newNumericValue || isNaN(Number(newNumericValue))) {
        return;
      }
      valueToAdd = newNumericValue;
    } else {
      if (!newValue.trim()) {
        return;
      }
      valueToAdd = newValue.trim();
    }

    const success = await onAdd(valueToAdd, selectedTab);
    if (success) {
      handleOpenChange(false);
    }
  };

  const getInputPlaceholder = () => {
    switch (selectedTab) {
      case "ufs":
        return "Digite a UF (máx. 2 caracteres)";
      case "dias_vencimento":
        return "Ex: 10 (entre 1 e 31)";
      case "valores_plano":
        return "Ex: 49.9";
      default:
        return "Digite o valor (máx. 25 caracteres)";
    }
  };

  const getInputLabel = () => {
    const option = tabOptions.find(opt => opt.value === selectedTab);
    return option ? option.label : "Valor";
  };

  const getMaxLength = () => {
    switch (selectedTab) {
      case "ufs":
        return 2;
      case "valores_plano":
        return 4;
      default:
        return 25;
    }
  };

  const isNumericInput = ["dias_vencimento", "valores_plano"].includes(selectedTab);
  const currentValue = isNumericInput ? newNumericValue : newValue;
  const maxLength = getMaxLength();

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Valor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tabSelect">Categoria</Label>
            <Select value={selectedTab} onValueChange={setSelectedTab}>
              <SelectTrigger id="tabSelect">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {tabOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valueInput">{getInputLabel()}</Label>
            {isNumericInput ? (
              <Input
                id="valueInput"
                type="number"
                step={selectedTab === "valores_plano" ? "0.1" : "1"}
                min={selectedTab === "dias_vencimento" ? "1" : "0"}
                max={selectedTab === "dias_vencimento" ? "31" : undefined}
                value={newNumericValue}
                onChange={(e) => setNewNumericValue(e.target.value)}
                placeholder={getInputPlaceholder()}
              />
            ) : (
              <div>
                <Input
                  id="valueInput"
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  maxLength={maxLength}
                />
                <div className="text-xs text-gray-500 text-right mt-0.5">
                  {newValue?.length || 0}/{maxLength}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={saving || (!currentValue || (typeof currentValue === 'string' && !currentValue.trim()))}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
