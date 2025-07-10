
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ImportErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
}

export const ImportErrorDialog = ({ isOpen, onClose, errors }: ImportErrorDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Erros na importação</DialogTitle>
          <DialogDescription>
            Alguns clientes não puderam ser importados pelos seguintes motivos:
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] mt-2">
          <ul className="list-disc pl-6 space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">{error}</li>
            ))}
          </ul>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
