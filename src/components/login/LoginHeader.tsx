
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const LoginHeader: React.FC = () => {
  return (
    <CardHeader className="space-y-1 text-center">
      <CardTitle className="text-2xl font-bold">Login</CardTitle>
      <CardDescription>
        Entre com seu email e senha para acessar o sistema
      </CardDescription>
    </CardHeader>
  );
};
