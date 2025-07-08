
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CadastrarClienteSecurityAlertProps {
  securityStatus: {
    hasWarnings: boolean;
    warnings: string[];
  };
}

export const CadastrarClienteSecurityAlert = ({ securityStatus }: CadastrarClienteSecurityAlertProps) => {
  if (!securityStatus.hasWarnings) return null;

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {securityStatus.warnings.join(", ")}
      </AlertDescription>
    </Alert>
  );
};
