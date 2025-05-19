
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (text: string) => void;
  saving: boolean;
}

export const ImportDialog = ({ isOpen, onOpenChange, onImport, saving }: ImportDialogProps) => {
  const [importText, setImportText] = useState("");

  const handleImport = () => {
    onImport(importText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Valores</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="importText" className="text-sm font-medium">
              Cole os valores abaixo (um por linha)
            </label>
            <textarea
              id="importText"
              className="w-full min-h-[200px] p-2 border rounded-md"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Valor 1&#10;Valor 2&#10;Valor 3"
            />
          </div>
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
            onClick={handleImport}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
