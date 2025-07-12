
-- Remover todas as funções relacionadas ao sistema de papéis de usuário
DROP FUNCTION IF EXISTS public.add_user_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.remove_user_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_all_users_with_roles();

-- Remover políticas RLS da tabela user_roles (mantendo a tabela)
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Desabilitar RLS na tabela user_roles
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
