
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSecureClienteOperations } from "@/hooks/cliente/useSecureClienteOperations";
import { Shield, Database, Lock } from "lucide-react";

const MigracaoDados = () => {
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { migrateSensitiveData, loading } = useSecureClienteOperations();

  const handleMigration = async () => {
    try {
      const result = await migrateSensitiveData();
      setMigrationResult(result);
      setIsCompleted(true);
    } catch (error) {
      console.error("Erro na migração:", error);
      setMigrationResult("Erro durante a migração: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  };

  return (
    <DashboardLayout title="Migração de Dados Sensíveis">
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Esta página permite executar a migração de criptografia para dados sensíveis dos clientes.
            Execute apenas uma vez para criptografar telefones, usuários MAC e senhas de aplicativos.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Criptografia de Dados Sensíveis
            </CardTitle>
            <CardDescription>
              Esta operação irá criptografar os seguintes campos dos clientes:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Dados Criptografados
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
                    <li>• Dados são criptografados no banco</li>
                    <li>• Descriptografia automática na visualização</li>
                    <li>• Chaves únicas por cliente/campo</li>
                    <li>• Processo totalmente transparente</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {migrationResult && (
              <Alert className={isCompleted ? "border-green-500" : "border-red-500"}>
                <AlertDescription>
                  {migrationResult}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleMigration}
                disabled={loading || isCompleted}
                className="flex items-center gap-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {isCompleted ? "Migração Concluída" : "Executar Migração"}
              </Button>

              {isCompleted && (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recarregar Página
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Importante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• Esta operação deve ser executada apenas uma vez</p>
              <p>• Dados já criptografados não serão reprocessados</p>
              <p>• A migração é segura e não afeta dados não sensíveis</p>
              <p>• Em caso de erro, os dados originais são preservados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MigracaoDados;
