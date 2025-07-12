
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface AuditStatsProps {
  stats: {
    total_events: number;
    auth_attempts: number;
    successful_logins: number;
    failed_attempts: number;
    recent_events: number;
  };
}

export function AuditStats({ stats }: AuditStatsProps) {
  // Verificar discrepâncias de auditoria
  const hasAuditDiscrepancy = stats && (
    stats.successful_logins > stats.auth_attempts ||
    stats.failed_attempts > stats.auth_attempts
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Estatísticas de Auditoria
          {hasAuditDiscrepancy && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </CardTitle>
        <CardDescription>
          Análise dos eventos de segurança registrados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_events}</div>
            <div className="text-sm text-muted-foreground">Total de Eventos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.successful_logins}</div>
            <div className="text-sm text-muted-foreground">Logins Bem-sucedidos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed_attempts}</div>
            <div className="text-sm text-muted-foreground">Tentativas Falhadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.recent_events}</div>
            <div className="text-sm text-muted-foreground">Últimas 24h</div>
          </div>
        </div>
        
        {hasAuditDiscrepancy && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Discrepância detectada</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Há mais eventos de login ({stats.successful_logins}) do que tentativas registradas ({stats.auth_attempts}). 
              Isso pode indicar que nem todas as tentativas estão sendo auditadas corretamente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
