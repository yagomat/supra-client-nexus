
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { PasswordChangeHeader } from "@/components/configuracoes/password/PasswordChangeHeader";
import { PasswordChangeFormContent } from "@/components/configuracoes/password/PasswordChangeFormContent";
import { PasswordChangeActions } from "@/components/configuracoes/password/PasswordChangeActions";

const AlterarSenha = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirecionar após 2 segundos
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleError = (error: string) => {
    console.error("Password error:", error);
  };

  const handleGeneralError = (error: string) => {
    console.error("General error:", error);
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <PasswordChangeHeader />
        <PasswordChangeFormContent
          onSuccess={handleSuccess}
          onError={handleError}
          onGeneralError={handleGeneralError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
        <PasswordChangeActions
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
};

export default AlterarSenha;
