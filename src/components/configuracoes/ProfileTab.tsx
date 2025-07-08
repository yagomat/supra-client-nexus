
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProfileForm } from "./ProfileForm";

export function ProfileTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerencie as configurações de segurança da sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Senha</p>
              <p className="text-sm text-muted-foreground">
                Altere sua senha regularmente para manter sua conta segura.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/alterar-senha")}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Dicas de Segurança</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use uma senha forte com pelo menos 8 caracteres</li>
              <li>• Inclua letras maiúsculas, minúsculas, números e símbolos</li>
              <li>• Não compartilhe sua senha com outras pessoas</li>
              <li>• Faça logout ao usar dispositivos compartilhados</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
