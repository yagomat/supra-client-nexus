
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useBancoDados } from "@/hooks/banco-dados/useBancoDados";
import { ValueManagerToolbar } from "@/components/banco-dados/ValueManagerToolbar";
import { TabsContainer } from "@/components/banco-dados/TabsContainer";
import { AddValueDialog } from "@/components/banco-dados/AddValueDialog";
import { ImportDialog } from "@/components/banco-dados/ImportDialog";
import { DeleteConfirmationDialog } from "@/components/banco-dados/DeleteConfirmationDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const BancoDados = () => {
  const isMobile = useIsMobile();
  const {
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
  } = useBancoDados();

  return (
    <DashboardLayout title="Banco de Dados">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Gerencie os valores predefinidos utilizados no sistema.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Carregando...</span>
          </div>
        ) : valoresPredefinidos ? (
          <Card className={isMobile ? "px-1 pb-6" : ""}>
            <CardHeader className={`${isMobile ? "px-3 pt-6 pb-4" : "pb-0"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle>Valores Predefinidos</CardTitle>
                <ValueManagerToolbar 
                  onAddClick={() => setIsAddDialogOpen(true)}
                />
              </div>
            </CardHeader>
            <CardContent className={isMobile ? "px-2 py-4" : ""}>
              <TabsContainer 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                valoresPredefinidos={valoresPredefinidos}
                onDeleteValue={(type, value) => setItemToDelete({ type, value })}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Dialogs */}
      <AddValueDialog 
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddValue}
        activeTab={activeTab}
        saving={saving}
      />

      <ImportDialog 
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
        saving={saving}
      />

      <DeleteConfirmationDialog 
        isOpen={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onDelete={handleDeleteValue}
        saving={saving}
      />
    </DashboardLayout>
  );
};

export default BancoDados;
