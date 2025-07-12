
-- 1. Criar enum para os papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'operador');

-- 2. Criar tabela user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função security definer para verificar papéis (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 5. Criar função para obter papéis do usuário
CREATE OR REPLACE FUNCTION public.get_user_roles(user_id_param UUID DEFAULT NULL)
RETURNS TABLE(role app_role)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Se não especificar user_id, usar o usuário logado
  IF user_id_param IS NULL THEN
    target_user_id := auth.uid();
  ELSE
    target_user_id := user_id_param;
  END IF;
  
  -- Verificar se é admin ou se está consultando próprios papéis
  IF NOT (public.has_role(auth.uid(), 'admin') OR auth.uid() = target_user_id) THEN
    RAISE EXCEPTION 'Acesso negado: sem permissão para visualizar papéis deste usuário';
  END IF;
  
  RETURN QUERY
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = target_user_id;
END;
$$;

-- 6. Criar função para adicionar papel ao usuário
CREATE OR REPLACE FUNCTION public.add_user_role(user_id_param UUID, role_param app_role)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se usuário logado é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem adicionar papéis';
  END IF;
  
  -- Inserir papel (ON CONFLICT para evitar duplicatas)
  INSERT INTO public.user_roles (user_id, role, created_by)
  VALUES (user_id_param, role_param, auth.uid())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details
  ) VALUES (
    auth.uid(),
    'user_role_added',
    jsonb_build_object(
      'target_user_id', user_id_param,
      'role', role_param,
      'timestamp', NOW()
    )
  );
END;
$$;

-- 7. Criar função para remover papel do usuário
CREATE OR REPLACE FUNCTION public.remove_user_role(user_id_param UUID, role_param app_role)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se usuário logado é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem remover papéis';
  END IF;
  
  -- Prevenir remoção do último admin
  IF role_param = 'admin' THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Não é possível remover o último administrador do sistema';
    END IF;
  END IF;
  
  -- Remover papel
  DELETE FROM public.user_roles 
  WHERE user_id = user_id_param AND role = role_param;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details
  ) VALUES (
    auth.uid(),
    'user_role_removed',
    jsonb_build_object(
      'target_user_id', user_id_param,
      'role', role_param,
      'timestamp', NOW()
    )
  );
END;
$$;

-- 8. Criar função para listar todos os usuários (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  roles app_role[]
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se usuário logado é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem listar usuários';
  END IF;
  
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    p.nome,
    au.created_at,
    COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), '{}') as roles
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  GROUP BY au.id, au.email, p.nome, au.created_at
  ORDER BY au.created_at DESC;
END;
$$;

-- 9. Políticas RLS para a tabela user_roles

-- Admins podem ver todos os papéis
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Usuários podem ver apenas seus próprios papéis
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Apenas admins podem inserir papéis
CREATE POLICY "Only admins can insert user roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem atualizar papéis
CREATE POLICY "Only admins can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem deletar papéis
CREATE POLICY "Only admins can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
