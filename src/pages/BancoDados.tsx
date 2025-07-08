
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
    <DashboardLayout title="Dados de Cadastro">
      <div className="space-y-8 animate-fade-in">
        {/* Header com gradiente */}
        <div className="relative p-6 bg-gradient-card rounded-lg border shadow-soft">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
          <div className="relative">
            <h2 className="text-2xl font-semibold mb-2 text-foreground">
              Banco de Dados
            </h2>
            <p className="text-muted-foreground">
              Gerencie valores predefinidos para agilizar o cadastro de clientes.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <span className="text-lg font-medium">Carregando dados...</span>
              <p className="text-muted-foreground">Aguarde enquanto buscamos os valores predefinidos</p>
            </div>
          </div>
        ) : valoresPredefinidos ? (
          <Card className={`card-enhanced animate-slide-up ${isMobile ? "px-1 pb-6" : ""}`}>
            <CardHeader className={`${isMobile ? "px-3 pt-6 pb-4" : "pb-0"} bg-gradient-subtle rounded-t-lg`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">D</span>
                  </div>
                  Valores Predefinidos
                </CardTitle>
                <ValueManagerToolbar 
                  onAddClick={() => setIsAddDialogOpen(true)}
                />
              </div>
            </CardHeader>
            <CardContent className={`${isMobile ? "px-2 py-4" : "p-6"}`}>
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
