
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Workflow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const N8nWorkflowTemplates = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${description} copiado para a área de transferência.`,
    });
  };

  const supabaseToEvolutionWorkflow = `{
  "name": "Supabase to Evolution API",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "supabase-to-evolution",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.action}}",
              "operation": "equal",
              "value2": "create_instance"
            }
          ]
        }
      },
      "id": "if-create-instance",
      "name": "If Create Instance",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "url": "={{$json.evolution_api_url}}/instance/create",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {},
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "instanceName",
              "value": "={{$json.instanceName}}"
            },
            {
              "name": "token",
              "value": "={{$json.evolution_api_key}}"
            },
            {
              "name": "qrcode",
              "value": true
            },
            {
              "name": "webhook",
              "value": "={{$json.webhook_url}}"
            }
          ]
        }
      },
      "id": "create-instance",
      "name": "Create Instance",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [680, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{JSON.stringify({success: true, data: $json})}}"
      },
      "id": "response-success",
      "name": "Response Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, 200]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{"node": "If Create Instance", "type": "main", "index": 0}]]
    },
    "If Create Instance": {
      "main": [[{"node": "Create Instance", "type": "main", "index": 0}]]
    },
    "Create Instance": {
      "main": [[{"node": "Response Success", "type": "main", "index": 0}]]
    }
  }
}`;

  const evolutionToSupabaseWorkflow = `{
  "name": "Evolution API to Supabase",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "evolution-events",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-evolution",
      "name": "Webhook Evolution",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.event}}",
              "operation": "equal",
              "value2": "qrcode.updated"
            }
          ]
        }
      },
      "id": "if-qr-update",
      "name": "If QR Update",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [460, 200]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.event}}",
              "operation": "equal",
              "value2": "connection.update"
            }
          ]
        }
      },
      "id": "if-connection-update",
      "name": "If Connection Update",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [460, 350]
    },
    {
      "parameters": {
        "url": "={{$json.supabase_url}}/functions/v1/whatsapp-bot",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {},
        "bodyParametersUi": {
          "parameter": [
            {
              "name": "event",
              "value": "={{$json.event}}"
            },
            {
              "name": "instance",
              "value": "={{$json.instance}}"
            },
            {
              "name": "data",
              "value": "={{$json.data}}"
            }
          ]
        }
      },
      "id": "update-supabase",
      "name": "Update Supabase",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [680, 275]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{JSON.stringify({received: true})}}"
      },
      "id": "response-received",
      "name": "Response Received",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [900, 275]
    }
  ],
  "connections": {
    "Webhook Evolution": {
      "main": [
        [{"node": "If QR Update", "type": "main", "index": 0}],
        [{"node": "If Connection Update", "type": "main", "index": 0}]
      ]
    },
    "If QR Update": {
      "main": [[{"node": "Update Supabase", "type": "main", "index": 0}]]
    },
    "If Connection Update": {
      "main": [[{"node": "Update Supabase", "type": "main", "index": 0}]]
    },
    "Update Supabase": {
      "main": [[{"node": "Response Received", "type": "main", "index": 0}]]
    }
  }
}`;

  const workflows = [
    {
      name: "Supabase → Evolution API",
      description: "Workflow que recebe comandos do Supabase e executa ações na Evolution API",
      webhook: "/webhook/supabase-to-evolution",
      actions: ["Criar instância", "Obter QR Code", "Enviar mensagem", "Desconectar"],
      json: supabaseToEvolutionWorkflow
    },
    {
      name: "Evolution API → Supabase",
      description: "Workflow que recebe eventos da Evolution API e atualiza o Supabase",
      webhook: "/webhook/evolution-events",
      actions: ["QR Code atualizado", "Status de conexão", "Mensagens recebidas", "Erros de conexão"],
      json: evolutionToSupabaseWorkflow
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="h-5 w-5" />
            <span>Templates de Workflows n8n</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {workflows.map((workflow, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">{workflow.name}</h3>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <Badge variant="outline">{workflow.webhook}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Ações Suportadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {workflow.actions.map((action, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(workflow.json, `Workflow ${workflow.name}`)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([workflow.json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Como Importar no n8n:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Acesse seu painel n8n</li>
              <li>2. Clique em "+" para criar novo workflow</li>
              <li>3. Clique nos "..." e selecione "Import from JSON"</li>
              <li>4. Cole o JSON do workflow copiado</li>
              <li>5. Configure as credenciais necessárias</li>
              <li>6. Ative o workflow</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
