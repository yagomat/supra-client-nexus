
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { useSecureClienteForm } from "@/hooks/cliente/useSecureClienteForm";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { CadastrarClienteBasicInformation } from "@/components/cliente/form-sections/CadastrarClienteBasicInformation";
import { CadastrarClienteMainScreen } from "@/components/cliente/form-sections/CadastrarClienteMainScreen";
import { CadastrarClienteAdditionalScreen } from "@/components/cliente/form-sections/CadastrarClienteAdditionalScreen";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CadastrarCliente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);

  // Usar o hook seguro para criação de cliente
  const {
    form,
    onSubmit,
    isSubmitting,
    securityStatus,
    isFormValid,
    realTimeValidation,
    toggleRealTimeValidation
  } = useSecureClienteForm({ 
    mode: "create"
  });

  // Carregar valores predefinidos
  useEffect(() => {
    const fetchValoresPredefinidos = async () => {
      try {
        setLoading(true);
        const data = await getValoresPredefinidos();
        setValoresPredefinidos(data);
      } catch (error) {
        console.error("Erro ao buscar valores predefinidos", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os valores predefinidos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchValoresPredefinidos();
  }, [toast]);

  // Sincronizar switch de tela adicional com formulário
  useEffect(() => {
    form.setValue("possui_tela_adicional", possuiTelaAdicional);
  }, [possuiTelaAdicional, form]);

  if (loading) {
    return (
      <DashboardLayout title="Cadastrar Cliente">
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Carregando valores predefinidos...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cadastrar Cliente">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Preencha os campos abaixo para cadastrar um novo cliente com validação de segurança.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Validação Segura</span>
          </div>
        </div>

        {/* Status de Segurança */}
        {securityStatus.hasErrors && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus.errors.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {securityStatus.hasWarnings && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus.warnings.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastrarClienteBasicInformation 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos} 
                  disabled={isSubmitting} 
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
                  disabled={isSubmitting} 
                />
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2 mb-6">
              <Switch
                id="possuiTelaAdicional"
                checked={possuiTelaAdicional}
                onCheckedChange={setPossuiTelaAdicional}
                disabled={isSubmitting}
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
                    disabled={isSubmitting} 
                  />
                </CardContent>
              </Card>
            )}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <ObservationsSection control={form.control} disabled={isSubmitting} />
              </CardContent>
            </Card>

            {/* Controles de Validação Avançada */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Validação de Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="realTimeValidation"
                    checked={realTimeValidation}
                    onCheckedChange={toggleRealTimeValidation}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="realTimeValidation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Validação em tempo real
                  </label>
                </div>
                
                {securityStatus.lastValidated && (
                  <div className="text-xs text-muted-foreground">
                    Última validação: {securityStatus.lastValidated.toLocaleTimeString()}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/clientes")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className="flex items-center space-x-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Shield className="h-4 w-4" />
                <span>Cadastrar Cliente</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CadastrarCliente;
