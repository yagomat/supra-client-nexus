
import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { CadastrarClienteHeader } from "@/components/cliente/cadastrar/CadastrarClienteHeader";
import { CadastrarClienteBasicInformation } from "@/components/cliente/form-sections/CadastrarClienteBasicInformation";
import { CadastrarClienteMainScreen } from "@/components/cliente/form-sections/CadastrarClienteMainScreen";
import { CadastrarClienteAdditionalScreen } from "@/components/cliente/form-sections/CadastrarClienteAdditionalScreen";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";
import { CadastrarClienteLoading } from "@/components/cliente/CadastrarClienteLoading";
import { CadastrarClienteSecurityAlert } from "@/components/cliente/CadastrarClienteSecurityAlert";
import { CadastrarClienteActions } from "@/components/cliente/CadastrarClienteActions";
import { CadastrarClienteTelaAdicionalToggle } from "@/components/cliente/CadastrarClienteTelaAdicionalToggle";
import { useCadastrarClienteForm } from "@/hooks/cliente/useCadastrarClienteForm";

const CadastrarCliente = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);

  const {
    form,
    onSubmit,
    isSubmitting,
    securityStatus,
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    handleCancel
  } = useCadastrarClienteForm();

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

  if (loading) {
    return <CadastrarClienteLoading />;
  }

  return (
    <DashboardLayout title="Cadastrar Cliente">
      <div className="w-full max-w-4xl mx-auto h-fit">
        <div className="space-y-6 pb-6">
          <CadastrarClienteHeader onBack={handleCancel} />
          
          <CadastrarClienteSecurityAlert securityStatus={securityStatus} />

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
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

              <CadastrarClienteTelaAdicionalToggle
                possuiTelaAdicional={possuiTelaAdicional}
                setPossuiTelaAdicional={setPossuiTelaAdicional}
                isSubmitting={isSubmitting}
              />

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

              <CadastrarClienteActions 
                isSubmitting={isSubmitting}
                onCancel={handleCancel}
              />
            </form>
          </Form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CadastrarCliente;
