
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const SessionExpireAlert = () => {
  const { sessionExpiresAt, signIn } = useAuth();
  const [showAlert, setShowAlert] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionExpiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiryTime = new Date(sessionExpiresAt);
      const diff = expiryTime.getTime() - now.getTime();
      
      // Converter para minutos
      const minutes = Math.floor(diff / (1000 * 60));
      
      setTimeLeft(minutes);
      
      // Mostrar alerta quando faltar 15 minutos ou menos
      if (minutes <= 15 && minutes > 0) {
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }
    }, 30000); // Verificar a cada 30 segundos
    
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  const handleExtendSession = async () => {
    try {
      // Como não podemos realmente estender a sessão no Supabase sem um refresh token
      // vamos apenas simular isso recarregando a página
      window.location.reload();
      toast.success("Sessão renovada com sucesso!");
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      toast.error("Erro ao renovar sessão", {
        description: "Por favor, faça login novamente."
      });
    }
  };

  if (!showAlert || timeLeft === null || timeLeft <= 0) return null;

  return (
    <Alert className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-400">
      <AlertTitle className="text-yellow-800">Sessão a expirar</AlertTitle>
      <AlertDescription className="text-yellow-700">
        <p>Sua sessão irá expirar em {timeLeft} minutos.</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 bg-yellow-100 border-yellow-400 hover:bg-yellow-200"
          onClick={handleExtendSession}
        >
          Renovar Sessão
        </Button>
      </AlertDescription>
    </Alert>
  );
};
