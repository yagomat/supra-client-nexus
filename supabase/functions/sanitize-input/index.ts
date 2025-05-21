
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Função de sanitização para strings sem depender de DOMPurify
function sanitizeString(input: string | null | undefined): string | null | undefined {
  if (!input) return input;
  
  // Implementação simples de sanitização
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

// Função de sanitização para objetos completos
function sanitizeObject<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = { ...obj };

  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => 
        typeof item === 'string' 
          ? sanitizeString(item) 
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item) 
            : item
      );
    }
  });

  return result as T;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter dados da requisição
    const data = await req.json();
    
    // Sanitizar input
    const sanitizedData = sanitizeObject(data);

    // Log para debug
    console.log("Dados sanitizados:", sanitizedData);

    // Verificar se há um endpoint para redirecionamento
    const endpoint = req.headers.get("x-target-endpoint") || "";
    
    if (!endpoint) {
      // Se não houver endpoint, apenas retornar os dados sanitizados
      return new Response(JSON.stringify({ 
        success: true, 
        data: sanitizedData 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Se houver endpoint, redirecionar para ele com os dados sanitizados
    // Isso permite usar este como middleware para outros edge functions
    const targetUrl = `${supabaseUrl}/functions/v1/${endpoint}`;
    
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.get("Authorization") || "",
      },
      body: JSON.stringify(sanitizedData),
    });
    
    const responseData = await response.json();
    
    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Erro ao sanitizar dados:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Erro ao processar requisição" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
