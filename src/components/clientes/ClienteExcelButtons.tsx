
import { useState } from "react";
import { Cliente } from "@/types";
import { SecureExcelActions } from "./excel/SecureExcelActions";
import { ExcelButtonsInfo } from "./excel/ExcelButtonsInfo";
import { ImportErrorDialog } from "./excel/ImportErrorDialog";

interface ClienteExcelButtonsProps {
  clientes: Cliente[];
  onImportSuccess: () => void;
}

export const ClienteExcelButtons = ({
  clientes,
  onImportSuccess
}: ClienteExcelButtonsProps) => {
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleImportErrors = (errors: string[]) => {
    setImportErrors(errors);
    setShowErrorDialog(true);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <SecureExcelActions clientesCount={clientes.length} />
        
        <ExcelButtonsInfo />
      </div>

      <ImportErrorDialog 
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        errors={importErrors}
      />
    </>
  );
};
