
import React, { useEffect, useState } from 'react';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface CSRFProtectionProps {
  children: React.ReactNode;
  showStatus?: boolean;
  onValidationFail?: () => void;
  strictMode?: boolean;
}

export const CSRFProtection: React.FC<CSRFProtectionProps> = ({
  children,
  showStatus = false,
  onValidationFail,
  strictMode = false
}) => {
  const { 
    validateRequest, 
    isValidOrigin, 
    csrfToken, 
    validateCSRFState,
    isAuthContextAvailable,
    authError
  } = useCSRFProtection();
  
  const [csrfState, setCSRFState] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>({ valid: true, errors: [], warnings: [] });

  useEffect(() => {
    if (validateCSRFState) {
      const state = validateCSRFState();
      setCSRFState(state);
      
      if (!state.valid && onValidationFail) {
        onValidationFail();
      }
    }
  }, [validateCSRFState, onValidationFail]);

  useEffect(() => {
    if (!isValidOrigin && onValidationFail) {
      onValidationFail();
    }
  }, [isValidOrigin, onValidationFail]);

  // Em modo estrito, bloquear se houver erros críticos
  if (strictMode && (!isValidOrigin || csrfState.errors.length > 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro de Segurança Crítico:</strong>
            <ul className="mt-2 list-disc list-inside">
              {!isValidOrigin && <li>Origem da requisição inválida</li>}
              {csrfState.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              Recarregue a página ou acesse diretamente pelo domínio oficial.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar warning se não for válida a origem mas não em modo estrito
  if (!isValidOrigin && !strictMode) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro de segurança: Esta página não pode ser carregada de uma origem externa.
          Por favor, recarregue a página.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {showStatus && (
        <div className="space-y-2 mb-4">
          {/* Status principal */}
          <Alert className={csrfState.valid ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
            {csrfState.valid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertDescription className={csrfState.valid ? "text-green-800" : "text-yellow-800"}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3 w-3" />
                <span className="font-medium">
                  Proteção CSRF: {csrfState.valid ? 'Ativa' : 'Com Avisos'}
                </span>
              </div>
              
              <div className="text-xs space-y-1">
                <div>✓ Token: {csrfToken ? 'Gerado' : 'Pendente'}</div>
                <div>✓ Origem: {isValidOrigin ? 'Válida' : 'Inválida'}</div>
                <div>✓ Contexto Auth: {isAuthContextAvailable ? 'Disponível' : 'Indisponível'}</div>
              </div>
            </AlertDescription>
          </Alert>
          
          {/* Erros */}
          {csrfState.errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erros de Segurança:</strong>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {csrfState.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Warnings */}
          {csrfState.warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Avisos:</strong>
                <ul className="mt-1 list-disc list-inside text-sm">
                  {csrfState.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Erro de contexto */}
          {authError && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                Contexto de autenticação: {authError}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      
      {/* Tokens CSRF ocultos para formulários */}
      <input type="hidden" name="_csrf_token" value={csrfToken} />
      <input type="hidden" name="_origin_check" value={window.location.origin} />
      <input type="hidden" name="_timestamp" value={new Date().toISOString()} />
      
      {children}
    </>
  );
};
