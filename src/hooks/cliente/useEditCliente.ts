import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ClienteFormValues } from "./clienteFormSchema";
import { getDefaultValues } from "./clienteFormUtils";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { SecureClienteService } from "@/services/secureClienteService";
import { ValoresPredefinidos, Cliente } from "@/types";

export const useEditCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [possuiTelaAdicional, setPossuiTelaAdicional] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Configurar formulário
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(undefined, "edit"),
    mode: 'onChange'
  });

  useEffect(() => {
    if (!id) {
      navigate("/clientes");
    }
  }, [id, navigate]);

  // Carregar dados do cliente e valores predefinidos
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [clienteData, valoresData] = await Promise.all([
          SecureClienteService.getClienteWithDecryptedData(id),
          getValoresPredefinidos()
        ]);
        
        console.log("Dados do cliente carregados:", clienteData);
        setCliente(clienteData);
        setValoresPredefinidos(valoresData);
        setPossuiTelaAdicional(clienteData.possui_tela_adicional || false);
      } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
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

  // Preencher o formulário quando os dados do cliente forem carregados
  useEffect(() => {
    if (cliente && form) {
      console.log("Preenchendo formulário com dados do cliente:", cliente);
      
      const formData = {
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
      };
      
      form.reset(formData);
    }
  }, [cliente, form]);

  // Sincronizar switch de tela adicional com formulário
  useEffect(() => {
    if (form) {
      form.setValue("possui_tela_adicional", possuiTelaAdicional);
    }
  }, [possuiTelaAdicional, form]);

  // Função simplificada para submit - atualização direta
  const handleFormSubmit = async (data: ClienteFormValues) => {
    if (!id) {
      console.error("ID do cliente não encontrado");
      return;
    }
    
    console.log("=== INICIANDO SUBMIT SIMPLIFICADO ===");
    console.log("ID:", id);
    console.log("Dados do formulário:", data);
    
    try {
      setIsSubmitting(true);
      
      // Preparar dados para atualização direta - sem validações extras
      const updateData: Partial<Cliente> = {
        nome: data.nome,
        telefone: data.telefone || null,
        codigo_pais_telefone: data.codigo_pais_telefone || "+55",
        uf: data.uf || null,
        servidor: data.servidor,
        dia_vencimento: data.dia_vencimento,
        valor_plano: data.valor_plano ? Number(data.valor_plano) : null,
        dispositivo_smart: data.dispositivo_smart || null,
        aplicativo: data.aplicativo,
        usuario_aplicativo: data.usuario_aplicativo || null,
        senha_aplicativo: data.senha_aplicativo || null,
        data_licenca_aplicativo: data.data_licenca_aplicativo || null,
        possui_tela_adicional: data.possui_tela_adicional || false,
        dispositivo_smart_2: data.possui_tela_adicional ? (data.dispositivo_smart_2 || null) : null,
        aplicativo_2: data.possui_tela_adicional ? (data.aplicativo_2 || null) : null,
        usuario_2: data.possui_tela_adicional ? (data.usuario_2 || null) : null,
        senha_2: data.possui_tela_adicional ? (data.senha_2 || null) : null,
        data_licenca_2: data.possui_tela_adicional ? (data.data_licenca_2 || null) : null,
        observacoes: data.observacoes || null,
        status: data.status || "inativo"
      };

      console.log("Dados preparados para envio:", updateData);

      // Chamar o serviço simplificado
      const result = await SecureClienteService.updateCliente(id, updateData);
      console.log("Resultado da atualização:", result);
      
      toast({
        title: "Cliente atualizado com sucesso",
        description: "As informações do cliente foram atualizadas.",
      });
      
      navigate("/clientes");
    } catch (error) {
      console.error("=== ERRO NO SUBMIT ===");
      console.error("Erro:", error);
      
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro interno. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("=== FIM DO SUBMIT ===");
    }
  };

  const isFormValid = form.formState.isValid;

  return {
    loading,
    cliente,
    valoresPredefinidos,
    possuiTelaAdicional,
    setPossuiTelaAdicional,
    form,
    handleFormSubmit,
    isSubmitting,
    isFormValid,
    navigate
  };
};
