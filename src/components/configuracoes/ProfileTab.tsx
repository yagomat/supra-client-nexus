
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
      <Card className="card-enhanced animate-scale-in">
        <CardHeader className="bg-gradient-subtle rounded-t-lg">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            Informações do Perfil
          </CardTitle>
          <CardDescription className="text-base">
            Atualize suas informações pessoais e mantenha seus dados sempre atualizados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ProfileForm />
        </CardContent>
      </Card>

      <Card className="card-enhanced animate-scale-in">
        <CardHeader className="bg-gradient-subtle rounded-t-lg">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Segurança da Conta
          </CardTitle>
          <CardDescription className="text-base">
            Gerencie as configurações de segurança e proteja sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg border border-border/50">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Senha</p>
              <p className="text-sm text-muted-foreground">
                Altere sua senha regularmente para manter sua conta segura.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/alterar-senha")}
              className="btn-enhanced flex items-center gap-2 shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <Lock className="h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4 p-4 bg-gradient-card rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="h-3 w-3 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Dicas de Segurança</p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 ml-8">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Use uma senha forte com pelo menos 8 caracteres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Inclua letras maiúsculas, minúsculas, números e símbolos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Não compartilhe sua senha com outras pessoas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Faça logout ao usar dispositivos compartilhados</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
