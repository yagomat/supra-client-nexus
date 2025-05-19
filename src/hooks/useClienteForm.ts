
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, ClienteFormValues } from "./cliente/clienteFormSchema";
import { useClienteData } from "./cliente/useClienteData";
import { useStatusMonitoring } from "./cliente/useStatusMonitoring";
import { useClienteSubmit } from "./cliente/useClienteSubmit";

export type { ClienteFormValues } from "./cliente/clienteFormSchema";

export const useClienteForm = (clienteId: string | undefined) => {
  // Agora useClienteData é chamado sem argumentos, conforme esperado
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

  // Monitorar alterações no status
  useStatusMonitoring(form, clienteId, clientePagamentos, originalVencimento);

  // Gerenciar submissão do formulário
  const { submitting, onSubmit } = useClienteSubmit(clienteId);

  // Atualizar o formulário quando os dados do cliente forem carregados
  if (cliente && !loading) {
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
    }, { keepDefaultValues: true });
  }

  return {
    form,
    loading,
    submitting,
    valoresPredefinidos,
    onSubmit,
  };
};
