
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface EditClienteErrorStateProps {
  onBack: () => void;
}

export const EditClienteErrorState: React.FC<EditClienteErrorStateProps> = ({
  onBack,
}) => {
  return (
    <DashboardLayout title="Editar Cliente">
      <div className="w-full p-4">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <span className="text-lg font-medium">Cliente não encontrado</span>
            <p className="text-muted-foreground">Não foi possível carregar os dados do cliente</p>
            <Button onClick={onBack} variant="outline">
              Voltar para lista de clientes
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
