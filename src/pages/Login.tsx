
import React from "react";
import { Card } from "@/components/ui/card";
import { LoginHeader } from "@/components/login/LoginHeader";
import { LoginForm } from "@/components/login/LoginForm";
import { LoginFooter } from "@/components/login/LoginFooter";
import { CSRFProtection } from "@/components/security/CSRFProtection";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="card-enhanced shadow-large">
          <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg"></div>
          <div className="relative">
            <CSRFProtection>
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
            </CSRFProtection>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
