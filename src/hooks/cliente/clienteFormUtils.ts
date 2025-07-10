import { Cliente } from "@/types";
import { ClienteFormValues } from "./clienteFormSchema";

// Função helper para sanitizar strings
export const sanitizeString = (value: string | undefined | null) => {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  return value.trim();
};

// Função helper para sanitizar números
export const sanitizeNumber = (value: string | number | undefined | null) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return value;
};

// Preparar valores padrão baseados nos dados iniciais
export const getDefaultValues = (initialData?: Cliente, mode?: "create" | "edit") => {
  if (initialData && mode === "edit") {
    return {
      nome: initialData.nome || "",
      telefone: initialData.telefone || "",
      codigo_pais_telefone: initialData.codigo_pais_telefone || "+55",
      uf: initialData.uf || "",
      servidor: initialData.servidor || "",
      dia_vencimento: initialData.dia_vencimento || 1,
      valor_plano: initialData.valor_plano?.toString() || "",
      dispositivo_smart: initialData.dispositivo_smart || "",
      aplicativo: initialData.aplicativo || "",
      usuario_aplicativo: initialData.usuario_aplicativo || "",
      senha_aplicativo: initialData.senha_aplicativo || "",
      data_licenca_aplicativo: initialData.data_licenca_aplicativo || "",
      possui_tela_adicional: initialData.possui_tela_adicional || false,
      dispositivo_smart_2: initialData.dispositivo_smart_2 || "",
      aplicativo_2: initialData.aplicativo_2 || "",
      usuario_2: initialData.usuario_2 || "",
      senha_2: initialData.senha_2 || "",
      data_licenca_2: initialData.data_licenca_2 || "",
      observacoes: initialData.observacoes || "",
      status: (initialData.status as "ativo" | "inativo") || "inativo"
    };
  }
  
  // Valores padrão para criação
  return {
    nome: "",
    telefone: "",
    codigo_pais_telefone: "+55",
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
    status: "inativo" as const
  };
};

// Converter dados do formulário para Cliente com sanitização adequada
export const convertFormToCliente = (data: ClienteFormValues): Partial<Cliente> => {
  console.log("Convertendo dados do formulário:", data);
  
  const cleanData = {
    nome: data.nome, // obrigatório
    servidor: data.servidor, // obrigatório
    dia_vencimento: data.dia_vencimento, // obrigatório
    aplicativo: data.aplicativo, // obrigatório
    usuario_aplicativo: data.usuario_aplicativo, // opcional
    senha_aplicativo: data.senha_aplicativo, // opcional
    codigo_pais_telefone: data.codigo_pais_telefone || "+55",
    possui_tela_adicional: data.possui_tela_adicional || false,
    status: data.status || "inativo",
    // Campos opcionais sanitizados
    telefone: sanitizeString(data.telefone),
    uf: sanitizeString(data.uf),
    valor_plano: sanitizeNumber(data.valor_plano),
    dispositivo_smart: sanitizeString(data.dispositivo_smart),
    data_licenca_aplicativo: sanitizeString(data.data_licenca_aplicativo),
    dispositivo_smart_2: sanitizeString(data.dispositivo_smart_2),
    aplicativo_2: sanitizeString(data.aplicativo_2),
    usuario_2: sanitizeString(data.usuario_2),
    senha_2: sanitizeString(data.senha_2),
    data_licenca_2: sanitizeString(data.data_licenca_2),
    observacoes: sanitizeString(data.observacoes)
  };

  console.log("Dados limpos:", cleanData);
  return cleanData;
};