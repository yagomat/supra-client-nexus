
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Smartphone, Cloud, Database } from "lucide-react";

export const EvolutionAPISetupGuide = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>WhatsApp Bot com Venom-bot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Configuração Simplificada!</strong> Este sistema agora usa Venom-bot 
              integrado diretamente, eliminando a necessidade de infraestrutura externa como 
              Evolution API, n8n ou Docker.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nova Arquitetura</h3>
            
            <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <span className="font-medium">Interface React</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <Cloud className="h-6 w-6 text-green-600" />
                <span className="font-medium">Supabase + Venom-bot</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-purple-600" />
                <span className="font-medium">WhatsApp</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-700">✅ Vantagens</h4>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Sem infraestrutura externa necessária</li>
                  <li>• Multi-usuário nativo</li>
                  <li>• Conexão direta e mais estável</li>
                  <li>• Mais rápido (sem intermediários)</li>
                  <li>• Configuração automática</li>
                  <li>• Mesma interface de usuário</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-red-700">❌ Removido</h4>
                <ul className="text-sm space-y-1 text-red-600">
                  <li>• Evolution API</li>
                  <li>• n8n workflows</li>
                  <li>• Docker containers</li>
                  <li>• VPS externa</li>
                  <li>• Configuração manual de webhooks</li>
                  <li>• Variáveis de ambiente complexas</li>
                </ul>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                <strong>Como funciona agora:</strong> Cada usuário pode conectar seu próprio WhatsApp 
                escaneando um QR Code. O Venom-bot roda diretamente na Edge Function do Supabase, 
                garantindo isolamento completo entre usuários.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">Funcionalidades Disponíveis</h4>
              <div className="grid gap-2 md:grid-cols-2">
                <Badge variant="outline" className="justify-start p-2">
                  Conexão Multi-usuário
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Envio de Mensagens
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Templates Personalizados
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Campanhas em Massa
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Auto-respostas
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Comandos via WhatsApp
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Lembretes de Pagamento
                </Badge>
                <Badge variant="outline" className="justify-start p-2">
                  Logs de Mensagens
                </Badge>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Próximos Passos</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Vá para a aba "Status & Controle"</li>
                <li>2. Clique em "Conectar" para gerar QR Code</li>
                <li>3. Escaneie com seu WhatsApp</li>
                <li>4. Comece a usar todas as funcionalidades!</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
