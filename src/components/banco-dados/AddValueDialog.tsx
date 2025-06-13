
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { parseMultipleValues, generateValuePreview } from "@/hooks/banco-dados/utils/multipleValueUtils";

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
      if (!newNumericValue) {
        return;
      }
      // Para dias de vencimento, verificar se contém múltiplos valores
      if (newNumericValue.includes(';')) {
        valueToAdd = newNumericValue;
      } else {
        const numValue = parseInt(newNumericValue);
        if (isNaN(numValue)) return;
        valueToAdd = numValue;
      }
    } else if (selectedTab === "valores_plano") {
      if (!newNumericValue) {
        return;
      }
      // Para valores de plano, aceitar múltiplos valores ou valor único
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
        return "Ex: SP;RJ;MG (máx. 10 valores, separados por ;)";
      case "dias_vencimento":
        return "Ex: 10;15;20 (entre 1 e 31, máx. 10 valores)";
      case "valores_plano":
        return "Ex: 49.9;99.9;199.9 (máx. R$ 1.000, 10 valores)";
      case "servidores":
        return "Ex: Servidor1;Servidor2 (máx. 25 chars, 10 valores)";
      case "dispositivos_smart":
        return "Ex: TV Box;Smart TV (máx. 25 chars, 10 valores)";
      case "aplicativos":
        return "Ex: Netflix;YouTube (máx. 25 chars, 10 valores)";
      default:
        return "Digite o valor (máx. 10 valores, separados por ;)";
    }
  };

  const getInputLabel = () => {
    const option = tabOptions.find(opt => opt.value === selectedTab);
    return option ? option.label : "Valor";
  };

  const getMaxLength = () => {
    // Considerando múltiplos valores, aumentar o limite
    switch (selectedTab) {
      case "ufs":
        return 50; // 10 UFs com 2 chars + separadores
      case "valores_plano":
      case "dias_vencimento":
        return 100; // Números e separadores
      default:
        return 300; // 10 valores com 25 chars + separadores
    }
  };

  const isNumericInput = ["dias_vencimento", "valores_plano"].includes(selectedTab);
  const currentValue = isNumericInput ? newNumericValue : newValue;
  const maxLength = getMaxLength();

  // Gerar preview dos valores que serão adicionados
  const getValuePreview = () => {
    if (!currentValue) return "";
    
    const values = parseMultipleValues(currentValue);
    if (values.length <= 1) return "";
    
    return `${values.length} valores: ${generateValuePreview(values)}`;
  };

  const valuePreview = getValuePreview();

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
              <div>
                <Input
                  id="valueInput"
                  type="text"
                  value={newNumericValue}
                  onChange={(e) => setNewNumericValue(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  maxLength={maxLength}
                />
                <div className="text-xs text-gray-500 text-right mt-0.5">
                  {newNumericValue?.length || 0}/{maxLength}
                </div>
              </div>
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
            {valuePreview && (
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                Preview: {valuePreview}
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
