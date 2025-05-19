
import { useState } from "react";

export const useValoresPredefinidosUI = () => {
  const [activeTab, setActiveTab] = useState("ufs");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; value: string | number } | null>(null);
  const [saving, setSaving] = useState(false);

  return {
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    itemToDelete,
    setItemToDelete,
    saving,
    setSaving,
  };
};
