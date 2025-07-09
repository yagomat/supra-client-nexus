
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Loader2 } from "lucide-react";

export const EditClienteLoadingState: React.FC = () => {
  return (
    <DashboardLayout title="Editar Cliente">
      <div className="w-full p-4">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <span className="text-lg font-medium">Carregando dados do cliente...</span>
            <p className="text-muted-foreground">Aguarde enquanto buscamos as informações</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
