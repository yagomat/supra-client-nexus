
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { getCliente, updateCliente } from "@/services/clienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { recalculateClientStatus } from "@/services/clientStatusService";
import { Cliente, ValoresPredefinidos, Pagamento } from "@/types";

// Form schema definition
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

export type ClienteFormValues = z.infer<typeof formSchema>;

export const useClienteForm = (clienteId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [clientePagamentos, setClientePagamentos] = useState<Pagamento[]>([]);
  const [originalVencimento, setOriginalVencimento] = useState<number>(1);

  const form = useForm<ClienteFormValues>({
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
        if (!clienteId) return;
        const cliente = await getCliente(clienteId);
        
        // Salvar o dia de vencimento original para comparação posterior
        setOriginalVencimento(cliente.dia_vencimento);
        
        // Buscar pagamentos do cliente para determinar o status
        const pagamentos = await getPagamentos(clienteId);
        setClientePagamentos(pagamentos);
        
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
  }, [clienteId, form, toast]);

  // Efeito para monitorar alterações no dia de vencimento
  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      // Se o dia de vencimento foi alterado
      if (name === "dia_vencimento" && clienteId && clientePagamentos.length > 0) {
        const newVencimento = Number(value.dia_vencimento);
        
        // Verificar se o vencimento foi realmente alterado
        if (newVencimento !== originalVencimento) {
          try {
            // Primeiro atualiza o dia de vencimento no backend
            await updateCliente(clienteId, { dia_vencimento: newVencimento });
            
            // Em seguida, aciona a recalculação de status usando a função simplificada
            await recalculateClientStatus(clienteId);
            
            // Busca o cliente atualizado para obter o novo status
            const clienteAtualizado = await getCliente(clienteId);
            
            // Atualiza o campo status no formulário
            form.setValue("status", clienteAtualizado.status);
          } catch (error) {
            console.error("Erro ao recalcular status do cliente:", error);
          }
        }
      }
    });
    
    // Cancelar a assinatura ao desmontar o componente
    return () => subscription.unsubscribe();
  }, [form, clienteId, clientePagamentos, originalVencimento]);

  const onSubmit = async (data: ClienteFormValues) => {
    if (!clienteId) return;
    
    try {
      setSubmitting(true);
      
      // Atualizar cliente
      await updateCliente(clienteId, {
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

  return {
    form,
    loading,
    submitting,
    valoresPredefinidos,
    onSubmit,
  };
};
