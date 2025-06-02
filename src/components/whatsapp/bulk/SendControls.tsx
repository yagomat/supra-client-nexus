
import { Button } from "@/components/ui/button";
import { Send, Clock } from "lucide-react";

interface Campaign {
  name: string;
  template_id: string;
  custom_message: string;
  send_interval_min: number;
  send_interval_max: number;
}

interface SendControlsProps {
  campaign: Campaign;
  selectedClients: string[];
  sending: boolean;
  onSend: () => void;
}

export const SendControls = ({ campaign, selectedClients, sending, onSend }: SendControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>
          Intervalo: {campaign.send_interval_min}s - {campaign.send_interval_max}s
        </span>
      </div>
      <Button 
        onClick={onSend} 
        disabled={sending || selectedClients.length === 0}
        className="min-w-[150px]"
      >
        {sending ? (
          <>Enviando...</>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Enviar para {selectedClients.length} cliente{selectedClients.length !== 1 ? 's' : ''}
          </>
        )}
      </Button>
    </div>
  );
};
