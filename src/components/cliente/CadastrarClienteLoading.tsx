
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export const CadastrarClienteLoading = () => {
  return (
    <DashboardLayout title="Cadastrar Cliente">
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <span className="text-lg font-medium">Carregando valores predefinidos...</span>
          <p className="text-muted-foreground">Aguarde enquanto preparamos o formulário</p>
        </div>
      </div>
    </DashboardLayout>
  );
};
