import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { useSecureClienteForm } from "@/hooks/cliente/useSecureClienteForm";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { getCliente } from "@/services/clienteService";
import { ValoresPredefinidos, Cliente } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { BasicInformationSection } from "@/components/cliente/form-sections/BasicInformationSection";
import { MainScreenSection } from "@/components/cliente/form-sections/MainScreenSection";
import { AdditionalScreenSection } from "@/components/cliente/form-sections/AdditionalScreenSection";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClienteFormValues } from "@/hooks/cliente/clienteFormSchema";

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);
  
  useEffect(() => {
    if (!id) {
      navigate("/clientes");
    }
  }, [id, navigate]);

  // Usar o hook seguro para edição de cliente
  const {
    form,
    onSubmit: originalOnSubmit,
    isSubmitting,
    securityStatus,
    isFormValid,
    realTimeValidation,
    toggleRealTimeValidation
  } = useSecureClienteForm({ 
    clienteId: id,
    initialData: cliente || undefined,
    mode: "edit"
  });

  // Carregar dados do cliente e valores predefinidos
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [clienteData, valoresData] = await Promise.all([
          getCliente(id),
          getValoresPredefinidos()
        ]);
        
        setCliente(clienteData);
        setValoresPredefinidos(valoresData);
        setPossuiTelaAdicional(clienteData.possui_tela_adicional || false);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do cliente",
          variant: "destructive",
        });
        navigate("/clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast, navigate]);

  // Sincronizar switch de tela adicional com formulário
  useEffect(() => {
    form.setValue("possui_tela_adicional", possuiTelaAdicional);
  }, [possuiTelaAdicional, form]);

  // Função para lidar com o submit do formulário
  const handleFormSubmit = async (data: ClienteFormValues) => {
    console.log("Dados do formulário antes da validação:", data);
    
    const requiredFields = [
      { field: 'nome', name: 'Nome' },
      { field: 'servidor', name: 'Servidor' },
      { field: 'aplicativo', name: 'Aplicativo' }
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
      data_licenca_aplicativo: data.data_licenca_aplicativo?.trim() === "" ? null : data.data_licenca_aplicativo,
      data_licenca_2: data.data_licenca_2?.trim() === "" ? null : data.data_licenca_2,
      // Garantir que campos opcionais não sejam strings vazias
      telefone: data.telefone?.trim() === "" ? null : data.telefone,
      uf: data.uf?.trim() === "" ? null : data.uf,
      valor_plano: data.valor_plano?.trim() === "" ? null : data.valor_plano,
      dispositivo_smart: data.dispositivo_smart?.trim() === "" ? null : data.dispositivo_smart,
      usuario_aplicativo: data.usuario_aplicativo?.trim() === "" ? null : data.usuario_aplicativo,
      senha_aplicativo: data.senha_aplicativo?.trim() === "" ? null : data.senha_aplicativo,
      dispositivo_smart_2: data.dispositivo_smart_2?.trim() === "" ? null : data.dispositivo_smart_2,
      aplicativo_2: data.aplicativo_2?.trim() === "" ? null : data.aplicativo_2,
      usuario_2: data.usuario_2?.trim() === "" ? null : data.usuario_2,
      senha_2: data.senha_2?.trim() === "" ? null : data.senha_2,
      observacoes: data.observacoes?.trim() === "" ? null : data.observacoes
    };

    console.log("Dados sanitizados:", sanitizedData);

    // Submeter usando o método seguro do hook
    try {
      await originalOnSubmit(sanitizedData);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Editar Cliente">
        <div className="space-y-8 animate-fade-in">
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
  }

  return (
    <DashboardLayout title="Editar Cliente">
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
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                <BasicInformationSection 
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
                <MainScreenSection 
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
                  <AdditionalScreenSection 
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

            {/* Controles de Validação Avançada */}
            <Card className="card-enhanced animate-slide-up">
              <CardHeader className="bg-gradient-subtle rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  Validação de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-card rounded border border-border/50">
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
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    Última validação: {securityStatus.lastValidated.toLocaleTimeString()}
                  </div>
                )}
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
                <span>Salvar Alterações</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default EditarCliente;
