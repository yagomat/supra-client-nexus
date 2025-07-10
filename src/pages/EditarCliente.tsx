
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEditCliente } from "@/hooks/cliente/useEditCliente";
import { EditClienteHeader } from "@/components/cliente/edit/EditClienteHeader";
import { EditClienteForm } from "@/components/cliente/edit/EditClienteForm";
import { EditClienteActions } from "@/components/cliente/edit/EditClienteActions";
import { EditClienteLoadingState } from "@/components/cliente/edit/EditClienteLoadingState";
import { EditClienteErrorState } from "@/components/cliente/edit/EditClienteErrorState";

const EditarCliente = () => {
  const {
    loading,
    cliente,
    valoresPredefinidos,
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    form,
    handleFormSubmit,
    isSubmitting,
    isFormValid,
    navigate
  } = useEditCliente();

  if (loading) {
    return <EditClienteLoadingState />;
  }

  if (!cliente) {
    return <EditClienteErrorState onBack={() => navigate("/clientes")} />;
  }

  return (
    <DashboardLayout title="Editar Cliente">
      <div className="w-full max-w-4xl mx-auto h-fit">
        <div className="space-y-6 pb-6">
          <EditClienteHeader 
            clienteNome={cliente.nome}
            onBack={() => navigate("/clientes")}
          />

          <EditClienteForm
            form={form}
            valoresPredefinidos={valoresPredefinidos}
            possuiTelaAdicional={possuiTelaAdicional}
            setPossuiTelaAdicional={setPossuiTelaAdicional}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          >
            <EditClienteActions
              isSubmitting={isSubmitting}
              isFormValid={isFormValid}
              onCancel={() => navigate("/clientes")}
            />
          </EditClienteForm>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditarCliente;
