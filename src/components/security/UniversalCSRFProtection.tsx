
import React, { useEffect } from 'react';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface UniversalCSRFProtectionProps {
  children: React.ReactNode;
  showStatus?: boolean;
  enforceSecureOrigin?: boolean;
  onValidationFail?: () => void;
  level?: 'basic' | 'strict';
}

export const UniversalCSRFProtection: React.FC<UniversalCSRFProtectionProps> = ({
  children,
  showStatus = false,
  enforceSecureOrigin = true,
  onValidationFail,
  level = 'strict'
}) => {
  const { validateRequest, isValidOrigin, csrfToken } = useCSRFProtection();

  useEffect(() => {
    // Validação contínua de origem
    if (enforceSecureOrigin && !isValidOrigin) {
      console.error('CSRF: Origem inválida detectada', {
        currentOrigin: window.location.origin,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      });
      
      if (onValidationFail) {
        onValidationFail();
      }
    }
  }, [isValidOrigin, enforceSecureOrigin, onValidationFail]);

  // Aplicar validação estrita se necessário
  useEffect(() => {
    if (level === 'strict') {
      const checkSecurityPeriodically = () => {
        if (!validateRequest()) {
          console.warn('CSRF: Validação de segurança falhou durante operação');
        }
      };

      const interval = setInterval(checkSecurityPeriodically, 30000); // Verificar a cada 30s
      return () => clearInterval(interval);
    }
  }, [level, validateRequest]);

  if (enforceSecureOrigin && !isValidOrigin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Segurança:</strong> Esta página não pode ser carregada de uma origem externa.
            Por favor, acesse diretamente através do domínio oficial.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {showStatus && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center gap-2">
              <Lock className="h-3 w-3" />
              <span>Proteção CSRF ativa - Conexão segura estabelecida</span>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Token CSRF oculto para formulários */}
      <input type="hidden" name="_csrf_token" value={csrfToken} />
      <input type="hidden" name="_origin_check" value={window.location.origin} />
      
      {children}
    </>
  );
};
