
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useClienteForm } from "@/hooks/useClienteForm";
import { BasicInformationSection } from "@/components/cliente/form-sections/BasicInformationSection";
import { MainScreenSection } from "@/components/cliente/form-sections/MainScreenSection";
import { AdditionalScreenSection } from "@/components/cliente/form-sections/AdditionalScreenSection";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";
import { useEffect } from "react";

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!id) {
      navigate("/clientes");
    }
  }, [id, navigate]);
  
  // Pass the ID from params to the hook
  const { form, loading, submitting, valoresPredefinidos, onSubmit } = useClienteForm(id);

  if (loading) {
    return (
      <DashboardLayout title="Editar Cliente">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Cliente">
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Edite as informações do cliente.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <BasicInformationSection 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos}
                  disabled={submitting}
                />
                <MainScreenSection 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos}
                  disabled={submitting}
                />
              </div>

              <div className="space-y-6">
                <AdditionalScreenSection 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos}
                  disabled={submitting}
                />
                <ObservationsSection 
                  control={form.control}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/clientes")}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default EditarCliente;
