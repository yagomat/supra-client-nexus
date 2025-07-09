
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export function ProfileTab() {
  return (
    <div className="space-y-6">
      <Card className="card-enhanced animate-scale-in">
        <CardHeader className="bg-gradient-subtle rounded-t-lg">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
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
            <Shield className="h-5 w-5 text-primary" />
            Segurança da Conta
          </CardTitle>
          <CardDescription className="text-base">
            Altere sua senha para manter sua conta segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
