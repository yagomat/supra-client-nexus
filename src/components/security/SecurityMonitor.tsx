
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Clock, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityValidationService } from '@/services/securityValidationService';

interface SecurityMetrics {
  critical_events: number;
  high_events: number;
  medium_events: number;
  rate_limit_hits: number;
  last_security_check: Date;
  session_timeout_minutes: number;
}

interface SecurityMonitorProps {
  showDetails?: boolean;
  alertLevel?: 'all' | 'critical' | 'high';
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({
  showDetails = false,
  alertLevel = 'critical'
}) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSecurityStatus = async () => {
      try {
        // Simular métricas de segurança (em produção, viria do backend)
        const mockMetrics: SecurityMetrics = {
          critical_events: 0,
          high_events: 1,
          medium_events: 3,
          rate_limit_hits: 2,
          last_security_check: new Date(),
          session_timeout_minutes: 480 // 8 horas
        };

        setMetrics(mockMetrics);

        // Verificar alertas baseados no nível
        const alerts: string[] = [];
        
        if (mockMetrics.critical_events > 0) {
          alerts.push(`${mockMetrics.critical_events} eventos críticos de segurança detectados`);
        }
        
        if (alertLevel !== 'critical' && mockMetrics.high_events > 0) {
          alerts.push(`${mockMetrics.high_events} eventos de alta prioridade detectados`);
        }
        
        if (alertLevel === 'all' && mockMetrics.medium_events > 0) {
          alerts.push(`${mockMetrics.medium_events} eventos de média prioridade detectados`);
        }

        if (mockMetrics.rate_limit_hits > 10) {
          alerts.push('Rate limiting sendo acionado frequentemente');
        }

        // Verificar timeout de sessão
        if (mockMetrics.session_timeout_minutes > 600) { // > 10 horas
          alerts.push('Timeout de sessão muito longo (recomendado: máximo 8 horas)');
        }

        setSecurityAlerts(alerts);
      } catch (error) {
        console.error('Erro ao verificar status de segurança:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSecurityStatus();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkSecurityStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [alertLevel]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 animate-spin" />
            <span className="text-sm">Verificando status de segurança...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  const hasAlerts = securityAlerts.length > 0;

  return (
    <div className="space-y-4">
      {/* Alertas de Segurança */}
      {hasAlerts && (
        <Alert variant={metrics.critical_events > 0 ? "destructive" : "default"} className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <strong>Alertas de Segurança:</strong>
              <ul className="list-disc list-inside text-sm space-y-1">
                {securityAlerts.map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Geral */}
      {!hasAlerts && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Sistema seguro - Sem alertas críticos</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes (se solicitado) */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Métricas de Segurança</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.critical_events}</div>
                <div className="text-xs text-gray-600">Críticos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.high_events}</div>
                <div className="text-xs text-gray-600">Alta Prioridade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{metrics.medium_events}</div>
                <div className="text-xs text-gray-600">Média Prioridade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.rate_limit_hits}</div>
                <div className="text-xs text-gray-600">Rate Limits</div>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Última Verificação:</span>
                </span>
                <span>{metrics.last_security_check.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Timeout de Sessão:</span>
                <span>{Math.floor(metrics.session_timeout_minutes / 60)}h {metrics.session_timeout_minutes % 60}min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
