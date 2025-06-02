
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WhatsAppCommand {
  id: string;
  command: string;
  message_received: string;
  response_sent?: string;
  status: string;
  created_at: string;
}

interface CommandHistoryProps {
  commands: WhatsAppCommand[];
  onRefresh: () => void;
}

export const CommandHistory = ({ commands, onRefresh }: CommandHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Histórico de Comandos</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {commands.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum comando executado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {commands.map((command) => (
                <div 
                  key={command.id} 
                  className="p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={command.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {command.status === 'success' ? 'Sucesso' : 'Erro'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(command.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{command.command}</p>
                  {command.response_sent && (
                    <p className="text-xs text-gray-600 mt-1">{command.response_sent}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
