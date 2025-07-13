
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Database, Info } from "lucide-react";

const MigracaoDados = () => {
  return (
    <DashboardLayout title="Migração de Dados">
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A funcionalidade de criptografia de dados sensíveis foi removida do sistema.
            Todos os dados são agora armazenados e exibidos em formato normal.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Informações sobre o gerenciamento de dados dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Dados dos Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Telefone do cliente</li>
                    <li>• Usuário MAC (principal)</li>
                    <li>• Senha do aplicativo (principal)</li>
                    <li>• Usuário MAC (tela adicional)</li>
                    <li>• Senha do aplicativo (tela adicional)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Como funciona</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Dados armazenados em texto normal</li>
                    <li>• Acesso direto na visualização</li>
                    <li>• Edição e consulta simplificadas</li>
                    <li>• Sistema totalmente transparente</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-green-500">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Sistema configurado para operação normal sem criptografia
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Todos os dados sensíveis foram limpos durante a migração</p>
              <p>• Os campos afetados foram resetados para valores vazios</p>
              <p>• É necessário recadastrar as informações sensíveis dos clientes</p>
              <p>• O sistema agora opera sem camadas de criptografia</p>
              <p>• Novos dados são armazenados diretamente no banco</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MigracaoDados;
