
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

// Since we can't directly use the user_roles table with the type system,
// we'll use raw SQL queries to interact with it

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
    
    // Use a direct query with type assertion to bypass TypeScript limitations
    const { data, error } = await supabase.rpc(
      'get_user_roles',
      { user_id_param: userId }
    ) as { data: { role: UserRole }[] | null, error: any };
      
    if (error) {
      console.error("Erro ao buscar papéis do usuário:", error);
      throw error;
    }
    
    // Extract roles from the response
    return data ? data.map(item => item.role) : [];
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

// This function handles role addition using RPC
export async function addUserRole(userId: string, role: UserRole): Promise<void> {
  // Verify if current user is admin first
  if (!await isAdmin()) {
    throw new Error("Permissão negada: Apenas administradores podem modificar papéis de usuários");
  }
  
  // Insert role using RPC function with type assertion
  const { error } = await supabase.rpc(
    'add_user_role',
    { 
      user_id_param: userId,
      role_param: role 
    }
  ) as { data: null, error: any };
    
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
  // Verify if current user is admin first
  if (!await isAdmin()) {
    throw new Error("Permissão negada: Apenas administradores podem modificar papéis de usuários");
  }
  
  // Remove role using RPC function with type assertion
  const { error } = await supabase.rpc(
    'remove_user_role',
    {
      user_id_param: userId,
      role_param: role
    }
  ) as { data: null, error: any };
    
  if (error) {
    console.error("Erro ao remover papel do usuário:", error);
    throw error;
  }
}
