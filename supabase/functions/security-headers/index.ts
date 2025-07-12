
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Headers de segurança essenciais
const securityHeaders = {
  // Content Security Policy - mais restritivo para produção
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' https://cdn.gpteng.co 'unsafe-inline'", // Permitir inline para desenvolvimento
    "style-src 'self' 'unsafe-inline'", // Tailwind precisa de inline styles
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; '),
  
  // Previne clickjacking
  'X-Frame-Options': 'DENY',
  
  // Força HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Previne MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection (legacy mas ainda útil)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // Cross-Origin Policies
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { ...corsHeaders, ...securityHeaders } 
    });
  }

  try {
    const { url, method, headers: requestHeaders } = await req.json();
    
    console.log('Security headers middleware called for:', { url, method });
    
    // Aplicar headers de segurança baseado no ambiente
    const environment = Deno.env.get('ENVIRONMENT') || 'development';
    let appliedHeaders = { ...securityHeaders };
    
    // CSP mais restritivo para produção
    if (environment === 'production') {
      appliedHeaders['Content-Security-Policy'] = [
        "default-src 'self'",
        "script-src 'self'", // Sem 'unsafe-inline' em produção
        "style-src 'self'", // Sem 'unsafe-inline' em produção
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://tmgofvlwnbsikvyaavgr.supabase.co wss://tmgofvlwnbsikvyaavgr.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
        "block-all-mixed-content"
      ].join('; ');
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      headers: appliedHeaders,
      environment,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        ...corsHeaders, 
        ...appliedHeaders,
        'Content-Type': 'application/json' 
      },
    });
  } catch (error) {
    console.error('Error in security-headers function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      headers: securityHeaders 
    }), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        ...securityHeaders,
        'Content-Type': 'application/json' 
      },
    });
  }
});
