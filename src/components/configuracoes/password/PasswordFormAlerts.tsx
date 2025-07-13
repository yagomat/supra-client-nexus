
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";

interface PasswordFormAlertsProps {
  generalError: string;
  successMessage: string;
}

export function PasswordFormAlerts({ generalError, successMessage }: PasswordFormAlertsProps) {
  if (!generalError && !successMessage) return null;

  return (
    <>
      {generalError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="default" className="bg-green-50 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
