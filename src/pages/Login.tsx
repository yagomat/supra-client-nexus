
import React from "react";
import { Card } from "@/components/ui/card";
import { LoginHeader } from "@/components/login/LoginHeader";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginFooter } from "@/components/login/LoginFooter";
import { useLoginForm } from "@/hooks/useLoginForm";

const Login = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    emailError,
    generalError,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <form onSubmit={handleSubmit}>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            emailError={emailError}
            generalError={generalError}
          />
          <LoginFooter isLoading={isLoading} />
        </form>
      </Card>
    </div>
  );
};

export default Login;
