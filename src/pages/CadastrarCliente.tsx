
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle } from "lucide-react";
import { TextareaField } from "@/components/form/TextareaField";
import { useCadastrarClienteForm } from "@/hooks/useCadastrarClienteForm";
import { CadastrarClienteBasicInformation } from "@/components/cliente/form-sections/CadastrarClienteBasicInformation";
import { CadastrarClienteMainScreen } from "@/components/cliente/form-sections/CadastrarClienteMainScreen";
import { CadastrarClienteAdditionalScreen } from "@/components/cliente/form-sections/CadastrarClienteAdditionalScreen";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";

const CadastrarCliente = () => {
  const navigate = useNavigate();
  const {
    form,
    loading,
    submitting,
    valoresPredefinidos,
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    handleSubmit
  } = useCadastrarClienteForm();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Cadastrar Cliente</h1>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Carregando...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Cadastrar Cliente</h1>
        <p className="text-muted-foreground">
          Preencha os campos abaixo para cadastrar um novo cliente.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastrarClienteBasicInformation 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos} 
                  disabled={submitting} 
                />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tela Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastrarClienteMainScreen 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos} 
                  disabled={submitting} 
                />
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2 mb-6">
              <Switch
                id="possuiTelaAdicional"
                checked={possuiTelaAdicional}
                onCheckedChange={setPossuiTelaAdicional}
                disabled={submitting}
              />
              <label
                htmlFor="possuiTelaAdicional"
                className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acrescentar uma tela adicional
              </label>
            </div>

            {possuiTelaAdicional && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Tela Adicional</CardTitle>
                </CardHeader>
                <CardContent>
                  <CadastrarClienteAdditionalScreen 
                    control={form.control} 
                    valoresPredefinidos={valoresPredefinidos} 
                    disabled={submitting} 
                  />
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <ObservationsSection control={form.control} disabled={submitting} />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/clientes")}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar Cliente
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CadastrarCliente;
