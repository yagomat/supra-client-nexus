
import { useState } from "react";
import { ValoresPredefinidos } from "@/types";
import { useAddValue } from "./actions/useAddValue";
import { useDeleteValue } from "./actions/useDeleteValue";
import { useImportExport } from "./actions/useImportExport";

export interface ValoresPredefinidosActionsProps {
  valoresPredefinidos: ValoresPredefinidos | null;
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>;
}

export const useValoresPredefinidosActions = ({ 
  valoresPredefinidos, 
  setValoresPredefinidos 
}: ValoresPredefinidosActionsProps) => {
  const [saving, setSaving] = useState(false);
  
  // Hooks para as diferentes ações
  const { handleAddValue: addValue, saving: addSaving } = useAddValue(valoresPredefinidos, setValoresPredefinidos);
  const { handleDeleteValue: deleteValue, saving: deleteSaving } = useDeleteValue(valoresPredefinidos, setValoresPredefinidos);
  const { handleImport: importValues, handleExport: exportValues, saving: importExportSaving } = useImportExport(valoresPredefinidos, setValoresPredefinidos);
  
  // Combinar todos os estados de salvamento
  const isSaving = saving || addSaving || deleteSaving || importExportSaving;
  
  return {
    saving: isSaving,
    handleAddValue: addValue,
    handleDeleteValue: deleteValue,
    handleImport: importValues,
    handleExport: exportValues,
  };
};
