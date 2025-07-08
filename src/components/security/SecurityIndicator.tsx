import React from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SecurityIndicatorProps {
  errors?: string[];
  warnings?: string[];
  isValid?: boolean;
  loading?: boolean;
  showDetails?: boolean;
}

export const SecurityIndicator = ({ 
  errors = [], 
  warnings = [], 
  isValid = true, 
  loading = false,
  showDetails = true 
}: SecurityIndicatorProps) => {
  
  const getSecurityLevel = () => {
    if (loading) return "checking";
    if (errors.length > 0) return "critical";
    if (warnings.length > 0) return "warning";
    if (isValid) return "secure";
    return "unknown";
  };

  const getSecurityIcon = () => {
    const level = getSecurityLevel();
    const className = "w-4 h-4";
    
    switch (level) {
      case "checking":
        return <Shield className={`${className} animate-pulse`} />;
      case "critical":
        return <ShieldX className={className} />;
      case "warning":
        return <ShieldAlert className={className} />;
      case "secure":
        return <ShieldCheck className={className} />;
      default:
        return <Shield className={className} />;
    }
  };

  const getSecurityBadge = () => {
    const level = getSecurityLevel();
    
    const badges = {
      checking: { variant: "outline" as const, text: "Validando...", className: "animate-pulse" },
      critical: { variant: "destructive" as const, text: "Crítico", className: "" },
      warning: { variant: "secondary" as const, text: "Atenção", className: "" },
      secure: { variant: "default" as const, text: "Seguro", className: "" },
      unknown: { variant: "outline" as const, text: "Desconhecido", className: "" }
    };

    const badge = badges[level];
    
    return (
      <Badge variant={badge.variant} className={`flex items-center gap-1 ${badge.className}`}>
        {getSecurityIcon()}
        {badge.text}
      </Badge>
    );
  };

  const getSecurityColor = () => {
    const level = getSecurityLevel();
    switch (level) {
      case "critical": return "border-destructive";
      case "warning": return "border-yellow-500";
      case "secure": return "border-green-500";
      default: return "border-muted";
    }
  };

  if (!showDetails && (errors.length === 0 && warnings.length === 0)) {
    return (
      <div className="flex items-center gap-2">
        {getSecurityBadge()}
      </div>
    );
  }

  return (
    <Card className={`${getSecurityColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {getSecurityIcon()}
          Status de Segurança
        </CardTitle>
        <CardDescription>
          Validações de segurança aplicadas aos dados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {getSecurityBadge()}
          
          {!loading && (
            <span className="text-sm text-muted-foreground">
              {errors.length === 0 && warnings.length === 0 
                ? "Todos os dados foram validados com segurança"
                : `${errors.length} erro(s), ${warnings.length} aviso(s)`
              }
            </span>
          )}
        </div>

        {/* Exibir erros críticos */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <ShieldX className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Problemas críticos encontrados:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Exibir avisos */}
        {warnings.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Avisos de segurança:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Indicador de sucesso */}
        {!loading && errors.length === 0 && warnings.length === 0 && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <p className="font-medium">Validações de segurança aprovadas</p>
              <p className="text-sm">
                Todos os dados foram validados e sanitizados com sucesso no backend.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Informações sobre as validações aplicadas */}
        {showDetails && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium">Validações aplicadas:</p>
            <ul className="space-y-1">
              <li>• Sanitização de dados no backend</li>
              <li>• Validação de campos obrigatórios</li>
              <li>• Verificação de formato de telefone</li>
              <li>• Validação de limites de caracteres</li>
              <li>• Autorização de usuário (RLS)</li>
              <li>• Rate limiting para operações</li>
              <li>• Auditoria de todas as operações</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};