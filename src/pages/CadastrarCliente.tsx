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
import { ClienteFormValues } from "@/hooks/cliente/clienteFormSchema";

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

  // Função personalizada para validar e processar dados antes da submissão
  const handleFormSubmission = async (data: ClienteFormValues) => {
    console.log("Dados do formulário antes da validação:", data);
    
    const requiredFields = [
      { field: 'nome', name: 'Nome' },
      { field: 'servidor', name: 'Servidor' },
      { field: 'aplicativo', name: 'Aplicativo' },
      { field: 'usuario_aplicativo', name: 'Usuário (MAC)' },
      { field: 'senha_aplicativo', name: 'Senha (Id)' }
    ];

    const missingFields = requiredFields.filter(({ field }) => !data[field as keyof ClienteFormValues]);

    if (missingFields.length > 0) {
      // Destacar campos obrigatórios
      missingFields.forEach(({ field }) => {
        form.setError(field as any, {
          type: 'required',
          message: 'Este campo é obrigatório'
        });
      });

      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Por favor, preencha: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Tratar campos de data - converter strings vazias para null
    const sanitizedData = {
      ...data,
      data_licenca_aplicativo: data.data_licenca_aplicativo === "" ? null : data.data_licenca_aplicativo,
      data_licenca_2: data.data_licenca_2 === "" ? null : data.data_licenca_2,
    };

    console.log("Dados sanitizados:", sanitizedData);

    // Chamar o onSubmit do hook que já está preparado para receber os dados
    await onSubmit(sanitizedData);
  };

  if (loading) {
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
  }

  return (
    <DashboardLayout title="Cadastrar Cliente">
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Status de Segurança */}
        {securityStatus.hasWarnings && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {securityStatus.warnings.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmission)} className="space-y-6">
            <Card>
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

            <Card>
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

            <div className="flex items-center space-x-3 p-4 border rounded-lg">
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
              <Card>
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

            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <ObservationsSection control={form.control} disabled={isSubmitting} />
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4 pt-6 border-t">
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
                disabled={isSubmitting}
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
