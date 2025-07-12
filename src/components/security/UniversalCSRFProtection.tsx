
import React, { useEffect, useState } from 'react';
import { CSRFProtection } from './CSRFProtection';
import { SecurityMonitor } from './SecurityMonitor';
import { SecurityValidationService } from '@/services/securityValidationService';

interface UniversalCSRFProtectionProps {
  children: React.ReactNode;
  level?: 'basic' | 'standard' | 'strict';
  showStatus?: boolean;
  showSecurityMonitor?: boolean;
  onValidationFail?: () => void;
}

export const UniversalCSRFProtection: React.FC<UniversalCSRFProtectionProps> = ({
  children,
  level = 'standard',
  showStatus = false,
  showSecurityMonitor = false,
  onValidationFail
}) => {
  const [securityValidated, setSecurityValidated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const validateSecurityContext = async () => {
      try {
        // Verificar se estamos em um contexto seguro
        const isSecureContext = window.isSecureContext;
        const hasValidOrigin = window.location.protocol === 'https:' || 
                               window.location.hostname === 'localhost';

        if (level === 'strict' && !isSecureContext) {
          throw new Error('Contexto inseguro detectado - HTTPS obrigatório');
        }

        if (!hasValidOrigin && level !== 'basic') {
          throw new Error('Origem não confiável detectada');
        }

        // Registrar validação bem-sucedida
        await SecurityValidationService.logSecurityEvent('context_validation', {
          risk_level: 'low',
          description: 'Contexto de segurança validado com sucesso',
          additional_data: {
            level,
            secure_context: isSecureContext,
            origin: window.location.origin
          }
        });

        setSecurityValidated(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro de validação de segurança';
        setValidationError(errorMessage);
        
        // Registrar falha de validação
        await SecurityValidationService.logSecurityEvent('context_validation_failed', {
          risk_level: 'high',
          description: errorMessage,
          additional_data: {
            level,
            origin: window.location.origin
          }
        });

        if (onValidationFail) {
          onValidationFail();
        }
      }
    };

    validateSecurityContext();
  }, [level, onValidationFail]);

  // Se não passou na validação de segurança em modo estrito, bloquear
  if (level === 'strict' && !securityValidated) {
    if (validationError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Falha na Validação de Segurança
            </h2>
            <p className="text-red-700 text-sm mb-4">{validationError}</p>
            <p className="text-red-600 text-xs">
              Recarregue a página ou acesse via HTTPS para continuar.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando contexto de segurança...</p>
        </div>
      </div>
    );
  }

  return (
    <CSRFProtection 
      showStatus={showStatus}
      onValidationFail={onValidationFail}
      strictMode={level === 'strict'}
    >
      {showSecurityMonitor && (
        <SecurityMonitor 
          showDetails={level === 'strict'} 
          alertLevel={level === 'basic' ? 'critical' : level === 'standard' ? 'high' : 'all'}
        />
      )}
      {children}
    </CSRFProtection>
  );
};
