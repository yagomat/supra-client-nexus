
import React, { useEffect } from 'react';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface CSRFProtectionProps {
  children: React.ReactNode;
  showStatus?: boolean;
  onValidationFail?: () => void;
}

export const CSRFProtection: React.FC<CSRFProtectionProps> = ({
  children,
  showStatus = false,
  onValidationFail
}) => {
  const { validateRequest, isValidOrigin, csrfToken } = useCSRFProtection();

  useEffect(() => {
    if (!isValidOrigin && onValidationFail) {
      onValidationFail();
    }
  }, [isValidOrigin, onValidationFail]);

  if (!isValidOrigin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro de segurança: Esta página não pode ser carregada de uma origem externa.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {showStatus && (
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Conexão segura ativa - Proteção CSRF habilitada
          </AlertDescription>
        </Alert>
      )}
      
      {/* Token CSRF oculto para formulários que precisam */}
      <input type="hidden" name="_csrf_token" value={csrfToken} />
      
      {children}
    </>
  );
};
