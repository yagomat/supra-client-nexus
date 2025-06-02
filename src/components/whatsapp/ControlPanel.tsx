
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Power, PowerOff, AlertTriangle } from "lucide-react";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface WhatsAppSession {
  id?: string;
  status: string;
  phone_number?: string;
  qr_code?: string;
  last_connected?: string;
  session_data?: any;
}

interface ControlPanelProps {
  session: WhatsAppSession | null;
  connecting: boolean;
  onInitialize: () => void;
  onDisconnect: () => void;
  onRefreshSession: () => void;
}

export const ControlPanel = ({ 
  session, 
  connecting, 
  onInitialize, 
  onDisconnect, 
  onRefreshSession 
}: ControlPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Power className="h-5 w-5" />
          <span>Controles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          {session?.status === 'connected' ? (
            <Button
              onClick={onDisconnect}
              variant="destructive"
              className="flex-1"
            >
              <PowerOff className="h-4 w-4 mr-2" />
              Desconectar
            </Button>
          ) : (
            <Button
              onClick={onInitialize}
              disabled={connecting}
              className="flex-1"
            >
              <Power className="h-4 w-4 mr-2" />
              {connecting ? 'Conectando...' : 'Conectar'}
            </Button>
          )}
        </div>

        {session?.status === 'qr_needed' && session.qr_code && (
          <QRCodeDisplay 
            qrCode={session.qr_code}
            onRefresh={onRefreshSession}
          />
        )}

        {session?.status === 'error' && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Configuração necessária:</strong> Para usar esta funcionalidade, 
              configure a Evolution API seguindo o guia na aba "Configuração".
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
