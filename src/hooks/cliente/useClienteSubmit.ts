
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { updateCliente } from "@/services/clienteService";
import { ClienteFormValues } from "./clienteFormSchema";

export const useClienteSubmit = (clienteId: string | undefined) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: ClienteFormValues) => {
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
    submitting,
    onSubmit: handleSubmit,
  };
};
