
-- Função para descriptografar dados sensíveis de clientes
CREATE OR REPLACE FUNCTION public.get_cliente_with_decrypted_data(p_cliente_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_result json;
BEGIN
  -- Buscar o cliente
  SELECT * INTO v_cliente 
  FROM public.clientes 
  WHERE id = p_cliente_id AND user_id = auth.uid();
  
  IF v_cliente IS NULL THEN
    RETURN json_build_object('error', 'Cliente não encontrado');
  END IF;
  
  -- Tentar descriptografar os campos sensíveis
  BEGIN
    v_result := json_build_object(
      'id', v_cliente.id,
      'created_at', v_cliente.created_at,
      'user_id', v_cliente.user_id,
      'nome', v_cliente.nome,
      'telefone', CASE 
        WHEN v_cliente.telefone IS NOT NULL AND length(v_cliente.telefone) > 50 
        THEN decrypt_cliente_password(v_cliente.telefone, v_cliente.id)
        ELSE v_cliente.telefone 
      END,
      'codigo_pais_telefone', v_cliente.codigo_pais_telefone,
      'uf', v_cliente.uf,
      'servidor', v_cliente.servidor,
      'dia_vencimento', v_cliente.dia_vencimento,
      'valor_plano', v_cliente.valor_plano,
      'dispositivo_smart', v_cliente.dispositivo_smart,
      'aplicativo', v_cliente.aplicativo,
      'usuario_aplicativo', CASE 
        WHEN v_cliente.usuario_aplicativo IS NOT NULL AND length(v_cliente.usuario_aplicativo) > 50 
        THEN decrypt_cliente_password(v_cliente.usuario_aplicativo, v_cliente.id)
        ELSE v_cliente.usuario_aplicativo 
      END,
      'senha_aplicativo', CASE 
        WHEN v_cliente.senha_aplicativo IS NOT NULL AND length(v_cliente.senha_aplicativo) > 50 
        THEN decrypt_cliente_password(v_cliente.senha_aplicativo, v_cliente.id)
        ELSE v_cliente.senha_aplicativo 
      END,
      'data_licenca_aplicativo', v_cliente.data_licenca_aplicativo,
      'possui_tela_adicional', v_cliente.possui_tela_adicional,
      'dispositivo_smart_2', v_cliente.dispositivo_smart_2,
      'aplicativo_2', v_cliente.aplicativo_2,
      'usuario_2', CASE 
        WHEN v_cliente.usuario_2 IS NOT NULL AND length(v_cliente.usuario_2) > 50 
        THEN decrypt_cliente_password(v_cliente.usuario_2, v_cliente.id)
        ELSE v_cliente.usuario_2 
      END,
      'senha_2', CASE 
        WHEN v_cliente.senha_2 IS NOT NULL AND length(v_cliente.senha_2) > 50 
        THEN decrypt_cliente_password(v_cliente.senha_2, v_cliente.id)
        ELSE v_cliente.senha_2 
      END,
      'data_licenca_2', v_cliente.data_licenca_2,
      'observacoes', v_cliente.observacoes,
      'status', v_cliente.status
    );
    
    RETURN v_result;
  EXCEPTION
    WHEN OTHERS THEN
      -- Em caso de erro na descriptografia, retornar dados originais
      RETURN row_to_json(v_cliente);
  END;
END;
$$;
