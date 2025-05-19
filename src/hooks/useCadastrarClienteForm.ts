
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCliente } from "@/services/clienteService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";
import { formSchema, ClienteFormValues } from "@/hooks/cliente";

export const useCadastrarClienteForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      uf: "",
      servidor: "",
      dia_vencimento: 1,
      valor_plano: undefined,
      
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
    }
  });

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

  // Update form when tela adicional changes
  useEffect(() => {
    form.setValue("possui_tela_adicional", possuiTelaAdicional);
  }, [possuiTelaAdicional, form]);

  const handleSubmit = async (data: ClienteFormValues) => {
    // Validar campos obrigatórios
    const requiredFields = ['nome', 'servidor', 'aplicativo'];
    const missingFields = requiredFields.filter((field) => !data[field as keyof typeof data]);

    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios faltando",
        description: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Formatar os dados para enviar ao servidor
      const clienteData = {
        nome: data.nome,
        telefone: data.telefone || null,
        uf: data.uf || null,
        servidor: data.servidor,
        dia_vencimento: data.dia_vencimento || 1,
        valor_plano: data.valor_plano || null,
        
        dispositivo_smart: data.dispositivo_smart || null,
        aplicativo: data.aplicativo,
        usuario_aplicativo: data.usuario_aplicativo,
        senha_aplicativo: data.senha_aplicativo,
        data_licenca_aplicativo: data.data_licenca_aplicativo || null,
        
        possui_tela_adicional: possuiTelaAdicional,
        dispositivo_smart_2: possuiTelaAdicional ? data.dispositivo_smart_2 || null : null,
        aplicativo_2: possuiTelaAdicional ? data.aplicativo_2 || null : null,
        usuario_2: possuiTelaAdicional ? data.usuario_2 || null : null,
        senha_2: possuiTelaAdicional ? data.senha_2 || null : null,
        data_licenca_2: possuiTelaAdicional ? data.data_licenca_2 || null : null,
        
        observacoes: data.observacoes || null
      };

      // Enviar dados para o backend
      await createCliente(clienteData);

      toast({
        title: "Cliente cadastrado com sucesso",
        description: `O cliente ${data.nome} foi cadastrado com sucesso.`,
      });

      // Redirecionar para a lista de clientes
      navigate("/clientes");
    } catch (error) {
      console.error("Erro ao cadastrar cliente", error);
      toast({
        title: "Erro ao cadastrar cliente",
        description: "Ocorreu um erro ao cadastrar o cliente. Por favor, tente novamente.",
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
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    handleSubmit,
  };
};
