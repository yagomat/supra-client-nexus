
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function PrivacyProtections() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4" />
          Proteções de Privacidade Ativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">IPs Mascarados</p>
              <p className="text-muted-foreground">Último octeto do IP é substituído por "xxx"</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">User-Agent Simplificado</p>
              <p className="text-muted-foreground">Apenas "Mobile" ou "Desktop" é mostrado</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">Dados Criptografados</p>
              <p className="text-muted-foreground">Informações sensíveis são criptografadas no banco</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="font-medium">Retenção Limitada</p>
              <p className="text-muted-foreground">Logs são removidos automaticamente após 90 dias</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
