
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, AlertTriangle } from "lucide-react";
import { useSecureClienteForm } from "@/hooks/cliente/useSecureClienteForm";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { getCliente } from "@/services/clienteService";
import { ValoresPredefinidos, Cliente } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { BasicInformationSection } from "@/components/cliente/form-sections/BasicInformationSection";
import { MainScreenSection } from "@/components/cliente/form-sections/MainScreenSection";
import { AdditionalScreenSection } from "@/components/cliente/form-sections/AdditionalScreenSection";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";
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

  // Carregar dados do cliente e valores predefinidos primeiro
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [clienteData, valoresData] = await Promise.all([
          getCliente(id),
          getValoresPredefinidos()
        ]);
        
        console.log("Dados do cliente carregados:", clienteData);
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

  // Usar o hook seguro para edição de cliente APÓS carregar os dados
  const {
    form,
    onSubmit: originalOnSubmit,
    isSubmitting,
    isFormValid
  } = useSecureClienteForm({ 
    clienteId: id,
    initialData: cliente || undefined,
    mode: "edit"
  });

  // Preencher o formulário quando os dados do cliente forem carregados
  useEffect(() => {
    if (cliente && form) {
      console.log("Preenchendo formulário com dados do cliente:", cliente);
      
      // Resetar o formulário com os dados do cliente
      form.reset({
        nome: cliente.nome || "",
        telefone: cliente.telefone || "",
        codigo_pais_telefone: cliente.codigo_pais_telefone || "+55",
        uf: cliente.uf || "",
        servidor: cliente.servidor || "",
        dia_vencimento: cliente.dia_vencimento || 1,
        valor_plano: cliente.valor_plano?.toString() || "",
        dispositivo_smart: cliente.dispositivo_smart || "",
        aplicativo: cliente.aplicativo || "",
        usuario_aplicativo: cliente.usuario_aplicativo || "",
        senha_aplicativo: cliente.senha_aplicativo || "",
        data_licenca_aplicativo: cliente.data_licenca_aplicativo || "",
        possui_tela_adicional: cliente.possui_tela_adicional || false,
        dispositivo_smart_2: cliente.dispositivo_smart_2 || "",
        aplicativo_2: cliente.aplicativo_2 || "",
        usuario_2: cliente.usuario_2 || "",
        senha_2: cliente.senha_2 || "",
        data_licenca_2: cliente.data_licenca_2 || "",
        observacoes: cliente.observacoes || "",
        status: (cliente.status as "ativo" | "inativo") || "inativo"
      });
    }
  }, [cliente, form]);

  // Sincronizar switch de tela adicional com formulário
  useEffect(() => {
    if (form) {
      form.setValue("possui_tela_adicional", possuiTelaAdicional);
    }
  }, [possuiTelaAdicional, form]);

  // Função para lidar com o submit do formulário
  const handleFormSubmit = async (data: ClienteFormValues) => {
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
  }

  if (!cliente) {
    return (
      <DashboardLayout title="Editar Cliente">
        <div className="w-full p-4">
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <span className="text-lg font-medium">Cliente não encontrado</span>
              <p className="text-muted-foreground">Não foi possível carregar os dados do cliente</p>
              <Button onClick={() => navigate("/clientes")} variant="outline">
                Voltar para lista de clientes
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Cliente">
      <div className="w-full max-w-4xl mx-auto space-y-6 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <BasicInformationSection 
              control={form.control} 
              valoresPredefinidos={valoresPredefinidos} 
              disabled={isSubmitting} 
            />

            <Card>
              <CardHeader>
                <CardTitle>Tela Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <MainScreenSection 
                  control={form.control} 
                  valoresPredefinidos={valoresPredefinidos} 
                  disabled={isSubmitting} 
                />
              </CardContent>
            </Card>

            <div className="flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-border/50">
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
                  <AdditionalScreenSection 
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

            <div className="flex justify-end space-x-4 pt-6 border-t border-border/50">
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
