
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

export async function getUserRoles(userId?: string): Promise<UserRole[]> {
  try {
    // Se não especificar um userId, pega o usuário logado
    if (!userId) {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }
      userId = currentUser.user.id;
    }
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Erro ao buscar papéis do usuário:", error);
      throw error;
    }
    
    return (data || []).map(row => row.role as UserRole);
  } catch (error) {
    console.error("Erro ao verificar papéis do usuário:", error);
    return [];
  }
}

export async function hasRole(role: UserRole, userId?: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

export async function isAdmin(userId?: string): Promise<boolean> {
  return await hasRole('admin', userId);
}

export async function isGerente(userId?: string): Promise<boolean> {
  return await hasRole('gerente', userId);
}

export async function addUserRole(userId: string, role: UserRole): Promise<void> {
  // Verificar se o usuário atual é administrador
  if (!await isAdmin()) {
    throw new Error("Permissão negada: Apenas administradores podem modificar papéis de usuários");
  }
  
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role
    });
    
  if (error) {
    if (error.code === '23505') { // Código para unique violation
      // O papel já existe para este usuário, não é um erro
      return;
    }
    console.error("Erro ao adicionar papel ao usuário:", error);
    throw error;
  }
}

export async function removeUserRole(userId: string, role: UserRole): Promise<void> {
  // Verificar se o usuário atual é administrador
  if (!await isAdmin()) {
    throw new Error("Permissão negada: Apenas administradores podem modificar papéis de usuários");
  }
  
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
    
  if (error) {
    console.error("Erro ao remover papel do usuário:", error);
    throw error;
  }
}
