
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Circle, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SetupChecklist = () => {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [testUrls, setTestUrls] = useState({
    evolutionApi: '',
    n8nWebhook: '',
    n8nEventsWebhook: ''
  });

  const checklistItems = [
    {
      id: 'vps-setup',
      title: 'VPS e EasyPanel Configurados',
      description: 'VPS criada e EasyPanel instalado com SSL',
      category: 'infrastructure'
    },
    {
      id: 'evolution-installed',
      title: 'Evolution API Instalada',
      description: 'Docker container rodando e acessível',
      category: 'evolution'
    },
    {
      id: 'evolution-webhook',
      title: 'Webhook Evolution Configurado',
      description: 'Evolution API enviando eventos para n8n',
      category: 'evolution'
    },
    {
      id: 'n8n-installed',
      title: 'n8n Instalado',
      description: 'n8n rodando e acessível via web',
      category: 'n8n'
    },
    {
      id: 'workflow-supabase-evolution',
      title: 'Workflow Supabase → Evolution',
      description: 'Workflow importado e ativo no n8n',
      category: 'n8n'
    },
    {
      id: 'workflow-evolution-supabase',
      title: 'Workflow Evolution → Supabase',
      description: 'Workflow importado e ativo no n8n',
      category: 'n8n'
    },
    {
      id: 'supabase-secrets',
      title: 'Secrets Supabase Configurados',
      description: 'Todas as variáveis de ambiente adicionadas',
      category: 'supabase'
    },
    {
      id: 'test-connection',
      title: 'Teste de Conexão',
      description: 'Conexão WhatsApp testada com sucesso',
      category: 'test'
    }
  ];

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const testConnection = async (url: string, type: string) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors'
      });
      
      toast({
        title: "Teste Realizado",
        description: `Requisição enviada para ${type}. Verifique os logs do serviço.`,
      });
    } catch (error) {
      toast({
        title: "Erro no Teste",
        description: `Não foi possível conectar com ${type}.`,
        variant: "destructive",
      });
    }
  };

  const getCategoryProgress = (category: string) => {
    const categoryItems = checklistItems.filter(item => item.category === category);
    const checkedCount = categoryItems.filter(item => checkedItems[item.id]).length;
    return `${checkedCount}/${categoryItems.length}`;
  };

  const categories = [
    { id: 'infrastructure', name: 'Infraestrutura', color: 'bg-blue-100 text-blue-800' },
    { id: 'evolution', name: 'Evolution API', color: 'bg-green-100 text-green-800' },
    { id: 'n8n', name: 'n8n Workflows', color: 'bg-purple-100 text-purple-800' },
    { id: 'supabase', name: 'Supabase', color: 'bg-orange-100 text-orange-800' },
    { id: 'test', name: 'Testes', color: 'bg-red-100 text-red-800' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Checklist de Configuração</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map(category => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{category.name}</h3>
                <Badge className={category.color}>
                  {getCategoryProgress(category.id)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {checklistItems
                  .filter(item => item.category === category.id)
                  .map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleItem(item.id)}
                    >
                      {checkedItems[item.id] ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-4">Testes de Conectividade</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="evolution-url">URL Evolution API</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="evolution-url"
                    placeholder="https://evolution.seudominio.com"
                    value={testUrls.evolutionApi}
                    onChange={(e) => setTestUrls(prev => ({ ...prev, evolutionApi: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection(testUrls.evolutionApi, 'Evolution API')}
                    disabled={!testUrls.evolutionApi}
                  >
                    Testar
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="n8n-webhook">URL Webhook n8n (Supabase → Evolution)</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="n8n-webhook"
                    placeholder="https://n8n.seudominio.com/webhook/supabase-to-evolution"
                    value={testUrls.n8nWebhook}
                    onChange={(e) => setTestUrls(prev => ({ ...prev, n8nWebhook: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => testConnection(testUrls.n8nWebhook, 'n8n Webhook')}
                    disabled={!testUrls.n8nWebhook}
                  >
                    Testar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Próximos Passos</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete todos os itens do checklist antes de tentar conectar o WhatsApp. 
                  Em caso de problemas, verifique os logs do n8n e Evolution API.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
