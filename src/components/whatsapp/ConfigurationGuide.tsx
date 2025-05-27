
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Server, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ConfigurationGuide = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const steps = [
    {
      id: 1,
      title: "Criar VPS na DigitalOcean",
      status: "pending",
      description: "Configure um droplet Ubuntu com pelo menos 2GB RAM",
      details: [
        "Acesse DigitalOcean e crie uma conta",
        "Crie um novo droplet Ubuntu 22.04",
        "Escolha um plano com mínimo 2GB RAM",
        "Configure SSH keys para acesso seguro"
      ]
    },
    {
      id: 2,
      title: "Instalar Evolution API",
      status: "pending", 
      description: "Clone e configure a Evolution API no servidor",
      commands: [
        "git clone https://github.com/EvolutionAPI/evolution-api.git",
        "cd evolution-api",
        "npm install",
        "cp src/env.yml.example src/env.yml"
      ]
    },
    {
      id: 3,
      title: "Configurar Environment",
      status: "pending",
      description: "Edite o arquivo env.yml com suas configurações",
      config: `# Server
SERVER:
  TYPE: http
  PORT: 8080
  URL: http://SEU_IP:8080

# Authentication
AUTHENTICATION:
  TYPE: apikey
  API_KEY:
    KEY: SUA_CHAVE_API_AQUI

# Webhook
WEBHOOK:
  GLOBAL:
    URL: ${window.location.origin}/functions/v1/whatsapp-bot
    ENABLED: true`
    },
    {
      id: 4,
      title: "Configurar Supabase",
      status: "pending",
      description: "Adicione as variáveis de ambiente no Supabase",
      variables: [
        { name: "EVOLUTION_API_URL", example: "http://SEU_IP:8080" },
        { name: "EVOLUTION_API_KEY", example: "SUA_CHAVE_API_AQUI" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Guia de Configuração - Evolution API</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Pré-requisitos:</strong> Você precisará de um VPS (recomendamos DigitalOcean) 
              e conhecimentos básicos de terminal Linux.
            </AlertDescription>
          </Alert>

          {steps.map((step, index) => (
            <div key={step.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{step.id}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {step.status === "pending" ? "Pendente" : "Concluído"}
                </Badge>
              </div>

              {step.details && (
                <div className="ml-11 space-y-2">
                  <ul className="space-y-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step.commands && (
                <div className="ml-11">
                  <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Comandos</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(step.commands!.join('\n'), "Comandos")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {step.commands.map((command, idx) => (
                      <div key={idx} className="text-sm text-green-400 font-mono">
                        $ {command}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.config && (
                <div className="ml-11">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Configuração env.yml</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(step.config!, "Configuração")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {step.config}
                    </pre>
                  </div>
                </div>
              )}

              {step.variables && (
                <div className="ml-11">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Adicione estas variáveis no painel do Supabase:
                    </p>
                    {step.variables.map((variable, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <code className="font-mono text-sm font-medium">{variable.name}</code>
                          <p className="text-xs text-gray-500 mt-1">{variable.example}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(variable.name, "Nome da variável")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {index < steps.length - 1 && <Separator className="ml-11" />}
            </div>
          ))}

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Recursos úteis:</strong>
              <div className="mt-2 space-y-1">
                <a 
                  href="https://doc.evolution-api.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-green-700 hover:text-green-800 underline"
                >
                  <span>Documentação Evolution API</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a 
                  href="https://www.digitalocean.com/community/tutorials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-green-700 hover:text-green-800 underline"
                >
                  <span>Tutoriais DigitalOcean</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
