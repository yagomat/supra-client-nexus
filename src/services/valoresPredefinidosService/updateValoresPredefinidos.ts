
import { supabase } from "@/integrations/supabase/client";
import { ValoresPredefinidos } from "@/types";
import { convertToSingularType } from "./utils";

/**
 * Atualiza os valores predefinidos para um determinado tipo
 */
export async function updateValoresPredefinidos(tipo: keyof ValoresPredefinidos, valores: string[] | number[]): Promise<void> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const user_id = currentUser.user.id;
  
  // Converter tipo para forma singular conforme armazenado no banco de dados
  const tipoSingular = convertToSingularType(tipo);
  
  // Excluir todos os valores existentes para este tipo e usuário
  const { error: deleteError } = await supabase
    .from('valores_predefinidos')
    .delete()
    .eq('user_id', user_id)
    .eq('tipo', tipoSingular);
    
  if (deleteError) {
    console.error("Erro ao excluir valores existentes:", deleteError);
    throw deleteError;
  }
  
  // Se não houver valores para inserir, terminamos
  if (valores.length === 0) {
    return;
  }
  
  // Validar e formatar valores antes de inserir
  const insertData = valores.map(valor => {
    // Garantir que os valores numéricos são armazenados corretamente
    let valorFormatado = valor;
    
    // Converter para o formato correto com base no tipo
    if (tipoSingular === 'valor_plano' && typeof valor === 'number') {
      // Armazenar valores de plano com até 2 casas decimais
      valorFormatado = parseFloat(valor.toFixed(2));
    } else if (tipoSingular === 'dia_vencimento' && typeof valor === 'number') {
      // Garantir que dias de vencimento são números inteiros
      valorFormatado = Math.round(valor);
    }
    
    return {
      user_id,
      tipo: tipoSingular,
      valor: valorFormatado.toString()
    };
  });
  
  // Inserir novos valores
  const { error: insertError } = await supabase
    .from('valores_predefinidos')
    .insert(insertData);
    
  if (insertError) {
    console.error("Erro ao inserir novos valores:", insertError);
    throw insertError;
  }
}
