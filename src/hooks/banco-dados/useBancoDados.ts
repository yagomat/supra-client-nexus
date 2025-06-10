
import { useValoresPredefinidosData } from "./useValoresPredefinidosData";
import { useValoresPredefinidosUI } from "./useValoresPredefinidosUI";
import { useValoresPredefinidosActions } from "./useValoresPredefinidosActions";

export const useBancoDados = () => {
  // Get data from the data hook
  const { 
    loading, 
    valoresPredefinidos, 
    setValoresPredefinidos 
  } = useValoresPredefinidosData();
  
  // Get UI state from the UI hook
  const { 
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    itemToDelete,
    setItemToDelete,
    saving: uiSaving,
    setSaving 
  } = useValoresPredefinidosUI();
  
  // Get actions from the actions hook
  const { 
    saving: actionSaving,
    handleAddValue: baseHandleAddValue,
    handleDeleteValue: baseHandleDeleteValue,
    handleImport: baseHandleImport,
    handleExport: baseHandleExport
  } = useValoresPredefinidosActions({ valoresPredefinidos, setValoresPredefinidos });
  
  // Wrapper functions to simplify component usage and handle dialog state
  const handleAddValue = async (value: string | number, tabType: string) => {
    const result = await baseHandleAddValue(value, tabType);
    if (result) {
      setIsAddDialogOpen(false);
    }
    return result;
  };
  
  const handleDeleteValue = async () => {
    if (!itemToDelete) return;
    const result = await baseHandleDeleteValue(itemToDelete.type, itemToDelete.value);
    if (result) {
      setItemToDelete(null);
    }
    return result;
  };
  
  const handleImport = async (importText: string) => {
    const result = await baseHandleImport(importText, activeTab);
    if (result) {
      setIsImportDialogOpen(false);
    }
    return result;
  };
  
  const handleExport = () => baseHandleExport(activeTab);
  
  // Combine the two saving states
  const saving = uiSaving || actionSaving;
  
  return {
    loading,
    saving,
    valoresPredefinidos,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    itemToDelete,
    setItemToDelete,
    handleAddValue,
    handleDeleteValue,
    handleImport,
    handleExport,
  };
};
