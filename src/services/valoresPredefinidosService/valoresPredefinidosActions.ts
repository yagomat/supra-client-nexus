
import { supabase } from "@/integrations/supabase/client";

export async function addValorPredefinido(tipo: string, valor: string | number) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc('add_valor_predefinido', {
    p_user_id: user.user.id,
    p_tipo: tipo,
    p_valor: valor.toString()
  });

  if (error) throw error;
  return data;
}

export async function deleteValorPredefinido(tipo: string, valor: string | number) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc('delete_valor_predefinido', {
    p_user_id: user.user.id,
    p_tipo: tipo,
    p_valor: valor.toString()
  });

  if (error) throw error;
  return data;
}

export async function importValoresPredefinidos(tipo: string, valores: string[]) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc('import_valores_predefinidos', {
    p_user_id: user.user.id,
    p_tipo: tipo,
    p_valores: valores
  });

  if (error) throw error;
  return data;
}

export async function getValoresPredefinidos() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc('get_valores_predefinidos', {
    p_user_id: user.user.id
  });

  if (error) throw error;
  return data;
}

export async function getValoresPredefinidosOrdered(tipo: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase.rpc('get_valores_predefinidos_ordered', {
    p_user_id: user.user.id,
    p_tipo: tipo
  });

  if (error) throw error;
  return data;
}

export async function validateClienteData(
  nome: string, 
  telefone: string | null, 
  uf: string | null, 
  servidor: string,
  diaVencimento: number,
  valorPlano: number | null,
  aplicativo: string,
  usuarioAplicativo: string,
  senhaAplicativo: string
) {
  const { data, error } = await supabase.rpc('validate_cliente_data', {
    p_nome: nome,
    p_telefone: telefone || '',
    p_uf: uf || '',
    p_servidor: servidor,
    p_dia_vencimento: diaVencimento,
    p_valor_plano: valorPlano || 0,
    p_aplicativo: aplicativo,
    p_usuario_aplicativo: usuarioAplicativo,
    p_senha_aplicativo: senhaAplicativo
  });

  if (error) throw error;
  return data;
}

export async function checkClienteLicencas(clienteId: string) {
  const { data, error } = await supabase.rpc('check_cliente_licencas', {
    p_cliente_id: clienteId
  });

  if (error) throw error;
  return data;
}
