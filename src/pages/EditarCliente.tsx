
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCliente, updateCliente } from "@/services/clienteService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Cliente, ValoresPredefinidos } from "@/types";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  telefone: z.string().optional(),
  uf: z.string().optional(),
  servidor: z.string().min(1, { message: "Servidor é obrigatório" }),
  dia_vencimento: z.coerce.number().min(1).max(31),
  valor_plano: z.coerce.number().optional(),
  
  // Tela principal
  dispositivo_smart: z.string().optional(),
  aplicativo: z.string().min(1, { message: "Aplicativo é obrigatório" }),
  usuario_aplicativo: z.string().min(1, { message: "Usuário é obrigatório" }),
  senha_aplicativo: z.string().min(1, { message: "Senha é obrigatória" }),
  data_licenca_aplicativo: z.string().optional(),
  
  // Tela adicional
  possui_tela_adicional: z.boolean().default(false),
  dispositivo_smart_2: z.string().optional(),
  aplicativo_2: z.string().optional(),
  usuario_2: z.string().optional(),
  senha_2: z.string().optional(),
  data_licenca_2: z.string().optional(),
  
  observacoes: z.string().optional(),
  status: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      uf: "",
      servidor: "",
      dia_vencimento: 1,
      valor_plano: 0,
      
      dispositivo_smart: "",
      aplicativo: "",
      usuario_aplicativo: "",
      senha_aplicativo: "",
      data_licenca_aplicativo: "",
      
      possui_tela_adicional: false,
      dispositivo_smart_2: "",
      aplicativo_2: "",
      usuario_2: "",
      senha_2: "",
      data_licenca_2: "",
      
      observacoes: "",
      status: "ativo",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados do cliente
        if (!id) return;
        const cliente = await getCliente(id);
        
        // Buscar valores predefinidos
        const predefinidos = await getValoresPredefinidos();
        setValoresPredefinidos(predefinidos);
        
        // Preencher o formulário com os dados do cliente
        form.reset({
          nome: cliente.nome,
          telefone: cliente.telefone || "",
          uf: cliente.uf || "",
          servidor: cliente.servidor,
          dia_vencimento: cliente.dia_vencimento,
          valor_plano: cliente.valor_plano || undefined,
          
          dispositivo_smart: cliente.dispositivo_smart || "",
          aplicativo: cliente.aplicativo,
          usuario_aplicativo: cliente.usuario_aplicativo,
          senha_aplicativo: cliente.senha_aplicativo,
          data_licenca_aplicativo: cliente.data_licenca_aplicativo || "",
          
          possui_tela_adicional: cliente.possui_tela_adicional,
          dispositivo_smart_2: cliente.dispositivo_smart_2 || "",
          aplicativo_2: cliente.aplicativo_2 || "",
          usuario_2: cliente.usuario_2 || "",
          senha_2: cliente.senha_2 || "",
          data_licenca_2: cliente.data_licenca_2 || "",
          
          observacoes: cliente.observacoes || "",
          status: cliente.status,
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do cliente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, toast]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      
      // Atualizar cliente
      await updateCliente(id, {
        ...data,
        telefone: data.telefone || null,
        uf: data.uf || null,
        valor_plano: data.valor_plano || null,
        dispositivo_smart: data.dispositivo_smart || null,
        data_licenca_aplicativo: data.data_licenca_aplicativo || null,
        dispositivo_smart_2: data.possui_tela_adicional ? data.dispositivo_smart_2 || null : null,
        aplicativo_2: data.possui_tela_adicional ? data.aplicativo_2 || null : null,
        usuario_2: data.possui_tela_adicional ? data.usuario_2 || null : null,
        senha_2: data.possui_tela_adicional ? data.senha_2 || null : null,
        data_licenca_2: data.possui_tela_adicional ? data.data_licenca_2 || null : null,
        observacoes: data.observacoes || null,
      });
      
      toast({
        title: "Cliente atualizado",
        description: "As informações do cliente foram atualizadas com sucesso.",
      });
      
      navigate("/clientes");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro ao atualizar as informações do cliente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const possuiTelaAdicional = form.watch("possui_tela_adicional");
  const statusAtivo = form.watch("status") === "ativo";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Editar Cliente</h1>
          <p className="text-muted-foreground">
            Edite as informações do cliente.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="border p-4 rounded-md space-y-4">
                  <h2 className="text-xl font-semibold">Informações Básicas</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do cliente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {valoresPredefinidos?.ufs && (
                      <FormField
                        control={form.control}
                        name="uf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UF</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um estado" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nao_informado">Não informado</SelectItem>
                                {valoresPredefinidos.ufs.map((uf) => (
                                  <SelectItem key={uf} value={uf}>
                                    {uf}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {valoresPredefinidos?.servidores && (
                      <FormField
                        control={form.control}
                        name="servidor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servidor</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um servidor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {valoresPredefinidos.servidores.map((servidor) => (
                                  <SelectItem key={servidor} value={servidor}>
                                    {servidor}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {valoresPredefinidos?.dias_vencimento && (
                      <FormField
                        control={form.control}
                        name="dia_vencimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dia de Vencimento</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value, 10))}
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o dia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {valoresPredefinidos.dias_vencimento.map((dia) => (
                                  <SelectItem key={dia} value={dia.toString()}>
                                    {dia}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {valoresPredefinidos?.valores_plano && (
                      <FormField
                        control={form.control}
                        name="valor_plano"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor do Plano (R$)</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseFloat(value))}
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o valor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="nao_informado">Não informado</SelectItem>
                                {valoresPredefinidos.valores_plano.map((valor) => (
                                  <SelectItem key={valor} value={valor.toString()}>
                                    R$ {valor.toFixed(2).replace('.', ',')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status do Cliente</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Cliente está ativo ou inativo no sistema
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value === "ativo"}
                            onCheckedChange={(checked) => field.onChange(checked ? "ativo" : "inativo")}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border p-4 rounded-md space-y-4">
                  <h2 className="text-xl font-semibold">Tela Principal</h2>

                  {valoresPredefinidos?.dispositivos_smart && (
                    <FormField
                      control={form.control}
                      name="dispositivo_smart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dispositivo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um dispositivo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="nao_informado">Não informado</SelectItem>
                              {valoresPredefinidos.dispositivos_smart.map((dispositivo) => (
                                <SelectItem key={dispositivo} value={dispositivo}>
                                  {dispositivo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {valoresPredefinidos?.aplicativos && (
                      <FormField
                        control={form.control}
                        name="aplicativo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Aplicativo</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um aplicativo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {valoresPredefinidos.aplicativos.map((app) => (
                                  <SelectItem key={app} value={app}>
                                    {app}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="data_licenca_aplicativo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data da Licença</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="usuario_aplicativo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Usuário do aplicativo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="senha_aplicativo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Senha do aplicativo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border p-4 rounded-md space-y-4">
                  <FormField
                    control={form.control}
                    name="possui_tela_adicional"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Tela Adicional</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Cliente possui uma tela adicional
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {possuiTelaAdicional && (
                    <div className="space-y-4 pt-2">
                      {valoresPredefinidos?.dispositivos_smart && (
                        <FormField
                          control={form.control}
                          name="dispositivo_smart_2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dispositivo</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um dispositivo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="nao_informado">Não informado</SelectItem>
                                  {valoresPredefinidos.dispositivos_smart.map((dispositivo) => (
                                    <SelectItem key={dispositivo} value={dispositivo}>
                                      {dispositivo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {valoresPredefinidos?.aplicativos && (
                          <FormField
                            control={form.control}
                            name="aplicativo_2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Aplicativo</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um aplicativo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nao_informado">Não informado</SelectItem>
                                    {valoresPredefinidos.aplicativos.map((app) => (
                                      <SelectItem key={app} value={app}>
                                        {app}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={form.control}
                          name="data_licenca_2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data da Licença</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="usuario_2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Usuário</FormLabel>
                              <FormControl>
                                <Input placeholder="Usuário do aplicativo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="senha_2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input type="text" placeholder="Senha do aplicativo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border p-4 rounded-md space-y-4">
                  <h2 className="text-xl font-semibold">Observações</h2>

                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações sobre o cliente"
                            className="min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
