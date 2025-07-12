
import React, { useEffect, useState } from 'react';
import { applySecurityHeadersViaMeta, monitorSecurityHeaders, checkSecurityHeaders } from '@/utils/securityHeaders';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface SecurityHeadersProviderProps {
  children: React.ReactNode;
  environment?: 'development' | 'production';
  showWarnings?: boolean;
}

export const SecurityHeadersProvider: React.FC<SecurityHeadersProviderProps> = ({
  children,
  environment = 'development',
  showWarnings = false
}) => {
  const [securityStatus, setSecurityStatus] = useState<{
    present: string[];
    missing: string[];
    warnings: string[];
    checked: boolean;
  }>({
    present: [],
    missing: [],
    warnings: [],
    checked: false
  });

  useEffect(() => {
    // Aplicar headers via meta tags como fallback
    applySecurityHeadersViaMeta({ environment });
    
    // Iniciar monitoramento
    monitorSecurityHeaders();
    
    // Verificar status dos headers
    const checkHeaders = async () => {
      const status = await checkSecurityHeaders();
      setSecurityStatus({ ...status, checked: true });
    };
    
    // Aguardar um pouco para garantir que a página carregou
    setTimeout(checkHeaders, 1000);
  }, [environment]);

  const hasSecurityIssues = securityStatus.missing.length > 0 || securityStatus.warnings.length > 0;

  return (
    <>
      {/* Avisos de segurança apenas em desenvolvimento ou quando solicitado */}
      {showWarnings && securityStatus.checked && hasSecurityIssues && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              {securityStatus.missing.length > 0 && (
                <div>
                  <strong>Headers de segurança ausentes:</strong>
                  <ul className="list-disc list-inside ml-2 text-sm">
                    {securityStatus.missing.map(header => (
                      <li key={header}>{header}</li>
                    ))}
                  </ul>
                </div>
              )}
              {securityStatus.warnings.length > 0 && (
                <div>
                  <strong>Avisos de segurança:</strong>
                  <ul className="list-disc list-inside ml-2 text-sm">
                    {securityStatus.warnings.map(warning => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status de segurança em desenvolvimento */}
      {environment === 'development' && securityStatus.checked && securityStatus.present.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-800 max-w-xs z-50">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>{securityStatus.present.length} headers de segurança ativos</span>
          </div>
        </div>
      )}

      {children}
    </>
  );
};
