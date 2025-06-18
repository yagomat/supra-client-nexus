
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { formSchema, ClienteFormValues } from "./cliente/clienteFormSchema";
import { useClienteData } from "./cliente/useClienteData";
import { useStatusMonitoring } from "./cliente/useStatusMonitoring";
import { useClienteSubmit } from "./cliente/useClienteSubmit";

export type { ClienteFormValues } from "./cliente/clienteFormSchema";

export const useClienteForm = (clienteId: string | undefined) => {
  const { 
    loading, 
    cliente, 
    valoresPredefinidos, 
    clientePagamentos, 
    originalVencimento 
  } = useClienteData();

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      uf: "",
      servidor: "",
      dia_vencimento: 1,
      valor_plano: "",
      
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

  // Only monitor status changes if we have a clienteId and data loaded
  useStatusMonitoring(form, clienteId, clientePagamentos || [], originalVencimento || 0);

  // Gerenciar submissão do formulário
  const { submitting, onSubmit } = useClienteSubmit(clienteId);

  // Effect to update form when cliente data is loaded
  useEffect(() => {
    if (cliente && !loading) {
      console.log("Carregando dados do cliente no formulário:", cliente);
      
      form.reset({
        nome: cliente.nome,
        telefone: cliente.telefone || "",
        uf: cliente.uf || "",
        servidor: cliente.servidor,
        dia_vencimento: cliente.dia_vencimento,
        valor_plano: cliente.valor_plano?.toString() || "",
        
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
    }
  }, [cliente, loading, form]);

  return {
    form,
    loading,
    submitting,
    valoresPredefinidos,
    onSubmit,
  };
};
