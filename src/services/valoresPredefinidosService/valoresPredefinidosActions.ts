
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
