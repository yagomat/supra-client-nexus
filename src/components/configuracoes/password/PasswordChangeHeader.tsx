
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordChangeHeader() {
  return (
    <CardHeader className="space-y-1 text-center">
      <CardTitle className="text-2xl font-bold">Alterar Senha</CardTitle>
      <CardDescription>
        Escolha uma nova senha para sua conta
      </CardDescription>
    </CardHeader>
  );
}
