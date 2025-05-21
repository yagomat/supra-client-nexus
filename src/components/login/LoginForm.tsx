
import React from "react";
import { Link } from "react-router-dom";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField, GeneralErrorAlert } from "@/components/cadastro/FormField";

interface LoginFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  emailError: string;
  generalError: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  emailError,
  generalError,
}) => {
  return (
    <CardContent className="space-y-4">
      <GeneralErrorAlert error={generalError} />

      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="nome@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={emailError}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Senha
          </label>
          <Link
            to="/recuperar-senha"
            className="text-sm text-primary hover:underline"
          >
            Esqueceu a senha?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
    </CardContent>
  );
};
