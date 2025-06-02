
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw } from "lucide-react";

interface QRCodeDisplayProps {
  qrCode: string;
  onRefresh: () => void;
}

export const QRCodeDisplay = ({ qrCode, onRefresh }: QRCodeDisplayProps) => {
  let qrImageUrl = '';
  if (qrCode.startsWith('data:image')) {
    qrImageUrl = qrCode;
  } else {
    qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg border">
      <QrCode className="h-8 w-8 text-gray-600" />
      <p className="text-sm text-gray-600 text-center">
        Escaneie o QR Code com seu WhatsApp
      </p>
      <img 
        src={qrImageUrl} 
        alt="QR Code WhatsApp" 
        className="border rounded-lg max-w-[200px] max-h-[200px]"
      />
      <p className="text-xs text-gray-500 text-center max-w-sm">
        Abra o WhatsApp no seu celular, vá em "Dispositivos Conectados" e escaneie este código.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex items-center space-x-2"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Atualizar QR Code</span>
      </Button>
    </div>
  );
};
