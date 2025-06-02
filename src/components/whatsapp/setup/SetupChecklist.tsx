
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SetupChecklist = () => {
  const { toast } = useToast();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const checklistItems = [
    {
      id: 'supabase-configured',
      title: 'Supabase Configurado',
      description: 'Projeto conectado e funcionando',
      category: 'infrastructure'
    },
    {
      id: 'venom-bot-integrated',
      title: 'Venom-bot Integrado',
      description: 'Edge Function com Venom-bot ativa',
      category: 'whatsapp'
    },
    {
      id: 'database-tables',
      title: 'Tabelas do Banco Criadas',
      description: 'Todas as tabelas WhatsApp existem',
      category: 'database'
    },
    {
      id: 'user-authentication',
      title: 'Autenticação Funcionando',
      description: 'Login/logout operacional',
      category: 'auth'
    },
    {
      id: 'whatsapp-connection',
      title: 'Conexão WhatsApp Testada',
      description: 'QR Code gerado e WhatsApp conectado',
      category: 'test'
    },
    {
      id: 'message-sending',
      title: 'Envio de Mensagens',
      description: 'Teste de envio bem-sucedido',
      category: 'test'
    },
    {
      id: 'templates-working',
      title: 'Templates Funcionando',
      description: 'Criação e uso de templates',
      category: 'features'
    },
    {
      id: 'auto-responses',
      title: 'Auto-respostas Ativas',
      description: 'Respostas automáticas configuradas',
      category: 'features'
    }
  ];

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoryProgress = (category: string) => {
    const categoryItems = checklistItems.filter(item => item.category === category);
    const checkedCount = categoryItems.filter(item => checkedItems[item.id]).length;
    return `${checkedCount}/${categoryItems.length}`;
  };

  const categories = [
    { id: 'infrastructure', name: 'Infraestrutura', color: 'bg-blue-100 text-blue-800' },
    { id: 'whatsapp', name: 'WhatsApp Bot', color: 'bg-green-100 text-green-800' },
    { id: 'database', name: 'Banco de Dados', color: 'bg-purple-100 text-purple-800' },
    { id: 'auth', name: 'Autenticação', color: 'bg-orange-100 text-orange-800' },
    { id: 'test', name: 'Testes', color: 'bg-red-100 text-red-800' },
    { id: 'features', name: 'Funcionalidades', color: 'bg-yellow-100 text-yellow-800' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Checklist Simplificado - Venom-bot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Configuração Simplificada!</h4>
                <p className="text-sm text-green-700 mt-1">
                  Com a nova implementação Venom-bot, não é mais necessário configurar Evolution API, 
                  n8n, VPS ou Docker. Tudo roda diretamente no Supabase!
                </p>
              </div>
            </div>
          </div>

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

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Como Testar</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Faça login no sistema</li>
              <li>2. Vá para "Status & Controle"</li>
              <li>3. Clique em "Conectar"</li>
              <li>4. Escaneie o QR Code com seu WhatsApp</li>
              <li>5. Teste envio de mensagem</li>
              <li>6. Configure templates e auto-respostas</li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Isolamento Multi-usuário</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Cada usuário terá sua própria sessão WhatsApp isolada. Os dados e mensagens 
                  de um usuário nunca serão visíveis para outros usuários.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
