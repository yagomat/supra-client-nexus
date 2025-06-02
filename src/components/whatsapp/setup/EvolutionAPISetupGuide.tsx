
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Terminal,
  Globe,
  Key,
  Workflow,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const EvolutionAPISetupGuide = () => {
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
      title: "Configurar VPS com EasyPanel",
      icon: <Server className="h-5 w-5" />,
      description: "Configure sua VPS e instale o EasyPanel",
      details: [
        "Crie uma VPS (recomendado: 2GB RAM, 20GB SSD)",
        "Instale o EasyPanel seguindo a documentação oficial",
        "Configure SSL com Let's Encrypt",
        "Anote o IP e domínio da sua VPS"
      ],
      links: [
        { name: "EasyPanel Documentation", url: "https://easypanel.io/docs" },
        { name: "DigitalOcean VPS", url: "https://digitalocean.com" }
      ]
    },
    {
      id: 2,
      title: "Instalar Evolution API",
      icon: <Globe className="h-5 w-5" />,
      description: "Configure a Evolution API no EasyPanel",
      dockerCompose: `version: '3.8'
services:
  evolution-api:
    image: atendai/evolution-api:v2.0.0
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_TYPE=http
      - SERVER_PORT=8080
      - SERVER_URL=https://seu-dominio.com
      - DATABASE_ENABLED=true
      - DATABASE_CONNECTION_URI=postgresql://user:pass@postgres:5432/evolution
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=SUA_CHAVE_API_EVOLUTION
      - WEBHOOK_GLOBAL_URL=https://seu-n8n.com/webhook/evolution
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
    volumes:
      - evolution_instances:/evolution/instances
      - evolution_store:/evolution/store
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_DB=evolution
      - POSTGRES_USER=evolution
      - POSTGRES_PASSWORD=evolution_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  evolution_instances:
  evolution_store:
  postgres_data:`,
      envVars: [
        { name: "SERVER_URL", value: "https://seu-dominio-evolution.com" },
        { name: "AUTHENTICATION_API_KEY", value: "sua-chave-api-evolution-super-secreta" },
        { name: "WEBHOOK_GLOBAL_URL", value: "https://seu-n8n.com/webhook/evolution-events" }
      ]
    },
    {
      id: 3,
      title: "Instalar n8n",
      icon: <Workflow className="h-5 w-5" />,
      description: "Configure o n8n para intermediar a comunicação",
      dockerCompose: `version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=sua_senha_n8n
      - N8N_HOST=seu-n8n.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://seu-n8n.com
      - GENERIC_TIMEZONE=America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:`,
      workflows: [
        {
          name: "Supabase → Evolution API",
          description: "Recebe comandos do Supabase e envia para Evolution API",
          endpoint: "/webhook/supabase-to-evolution"
        },
        {
          name: "Evolution API → Supabase",
          description: "Recebe eventos da Evolution API e atualiza Supabase",
          endpoint: "/webhook/evolution-events"
        }
      ]
    },
    {
      id: 4,
      title: "Configurar Workflows n8n",
      icon: <Database className="h-5 w-5" />,
      description: "Crie os workflows de comunicação",
      workflowConfig: {
        "Supabase → Evolution": {
          trigger: "Webhook",
          actions: [
            "Receber dados do Supabase",
            "Validar ação solicitada",
            "Fazer requisição para Evolution API",
            "Retornar resposta para Supabase"
          ]
        },
        "Evolution → Supabase": {
          trigger: "Webhook da Evolution API",
          actions: [
            "Receber evento da Evolution API",
            "Processar tipo de evento",
            "Atualizar banco Supabase",
            "Processar auto-respostas se necessário"
          ]
        }
      }
    },
    {
      id: 5,
      title: "Configurar Secrets Supabase",
      icon: <Key className="h-5 w-5" />,
      description: "Configure as variáveis de ambiente no Supabase",
      secrets: [
        {
          name: "N8N_WEBHOOK_SUPABASE_TO_EVOLUTION",
          description: "URL do webhook do n8n que recebe comandos do Supabase",
          example: "https://seu-n8n.com/webhook/supabase-to-evolution"
        },
        {
          name: "EVOLUTION_API_URL",
          description: "URL base da sua Evolution API",
          example: "https://seu-dominio-evolution.com"
        },
        {
          name: "EVOLUTION_API_KEY",
          description: "Chave de API da Evolution API",
          example: "sua-chave-api-evolution-super-secreta"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Guia Completo - Evolution API + n8n + Supabase</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Arquitetura:</strong> Supabase ↔ n8n ↔ Evolution API ↔ WhatsApp
              <br />
              O n8n atua como intermediário, facilitando a comunicação e processamento de eventos.
            </AlertDescription>
          </Alert>

          {steps.map((step, index) => (
            <div key={step.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Etapa {step.id}
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

              {step.dockerCompose && (
                <div className="ml-11">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">docker-compose.yml</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(step.dockerCompose!, "Docker Compose")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                      {step.dockerCompose}
                    </pre>
                  </div>
                </div>
              )}

              {step.envVars && (
                <div className="ml-11">
                  <h4 className="text-sm font-medium mb-2">Variáveis de Ambiente Importantes:</h4>
                  <div className="space-y-2">
                    {step.envVars.map((envVar, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <code className="font-mono text-sm font-medium">{envVar.name}</code>
                          <p className="text-xs text-gray-500 mt-1">{envVar.value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`${envVar.name}=${envVar.value}`, "Variável")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.workflows && (
                <div className="ml-11">
                  <h4 className="text-sm font-medium mb-2">Workflows a Criar:</h4>
                  <div className="space-y-2">
                    {step.workflows.map((workflow, idx) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-medium text-green-800">{workflow.name}</div>
                        <div className="text-sm text-green-600">{workflow.description}</div>
                        <code className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded mt-1 inline-block">
                          {workflow.endpoint}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.workflowConfig && (
                <div className="ml-11">
                  <h4 className="text-sm font-medium mb-2">Configuração dos Workflows:</h4>
                  <div className="space-y-3">
                    {Object.entries(step.workflowConfig).map(([name, config]) => (
                      <div key={name} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="font-medium text-purple-800 mb-2">{name}</div>
                        <div className="text-sm text-purple-600 mb-2">
                          <strong>Trigger:</strong> {config.trigger}
                        </div>
                        <div className="text-sm text-purple-600">
                          <strong>Ações:</strong>
                          <ul className="mt-1 ml-4">
                            {config.actions.map((action, idx) => (
                              <li key={idx} className="list-disc">{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.secrets && (
                <div className="ml-11">
                  <h4 className="text-sm font-medium mb-2">Secrets a Configurar no Supabase:</h4>
                  <div className="space-y-2">
                    {step.secrets.map((secret, idx) => (
                      <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <code className="font-mono text-sm font-medium text-yellow-800">
                              {secret.name}
                            </code>
                            <p className="text-sm text-yellow-600 mt-1">{secret.description}</p>
                            <p className="text-xs text-yellow-500 mt-1">
                              Exemplo: {secret.example}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(secret.name, "Nome do secret")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step.links && (
                <div className="ml-11">
                  <h4 className="text-sm font-medium mb-2">Links Úteis:</h4>
                  <div className="space-y-1">
                    {step.links.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        <span>{link.name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
              <strong>Próximos Passos:</strong> Após configurar tudo, teste a conexão usando o botão 
              "Conectar" na aba "Status & Controle". O QR Code deve aparecer automaticamente.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
