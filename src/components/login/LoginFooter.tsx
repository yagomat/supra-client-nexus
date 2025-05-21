
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoginFooterProps {
  isLoading: boolean;
}

export const LoginFooter: React.FC<LoginFooterProps> = ({ isLoading }) => {
  return (
    <CardFooter className="flex flex-col space-y-4">
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Entrar
      </Button>
      <div className="text-center text-sm">
        Não possui uma conta?{" "}
        <Link to="/cadastro" className="text-primary hover:underline">
          Cadastre-se
        </Link>
      </div>
    </CardFooter>
  );
};
