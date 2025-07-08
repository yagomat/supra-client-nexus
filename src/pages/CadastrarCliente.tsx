
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
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <span className="text-lg font-medium">Carregando valores predefinidos...</span>
              <p className="text-muted-foreground">Aguarde enquanto preparamos o formulário</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cadastrar Cliente">
      <div className="space-y-8 animate-fade-in">
        {/* Status de Segurança */}
        {securityStatus.hasErrors && (
          <Alert variant="destructive" className="animate-scale-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus.errors.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {securityStatus.hasWarnings && (
          <Alert className="animate-scale-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus.warnings.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <Card className="card-enhanced animate-slide-up">
              <CardHeader className="bg-gradient-subtle rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">1</span>
                  </div>
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CadastrarClienteBasicInformation 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos} 
                  disabled={isSubmitting} 
                />
              </CardContent>
            </Card>

            <Card className="card-enhanced animate-slide-up">
              <CardHeader className="bg-gradient-subtle rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">2</span>
                  </div>
                  Tela Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <CadastrarClienteMainScreen 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos} 
                  disabled={isSubmitting} 
                />
              </CardContent>
            </Card>

            <div className="flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-border/50 animate-slide-up">
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
              <Card className="card-enhanced animate-scale-in">
                <CardHeader className="bg-gradient-subtle rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    Tela Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CadastrarClienteAdditionalScreen 
                    control={form.control} 
                    valoresPredefinidos={valoresPredefinidos} 
                    disabled={isSubmitting} 
                  />
                </CardContent>
              </Card>
            )}

            <Card className="card-enhanced animate-slide-up">
              <CardHeader className="bg-gradient-subtle rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">4</span>
                  </div>
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ObservationsSection control={form.control} disabled={isSubmitting} />
              </CardContent>
            </Card>


            <div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
              <Button
                variant="outline"
                type="button"
                onClick={() => navigate("/clientes")}
                disabled={isSubmitting}
                className="transition-all duration-300 hover:shadow-soft"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className="btn-enhanced bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-soft hover:shadow-medium transition-all duration-300 flex items-center space-x-2"
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
