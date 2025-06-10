
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar } from "lucide-react";
import { AppVencendo, ClienteEmRisco } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertCardsProps {
  clientesInativos: number;
  appsVencendo: AppVencendo[];
  clientesEmRiscoDetalhes: ClienteEmRisco[];
  loading: boolean;
}

export const AlertCards = ({ clientesInativos, appsVencendo, clientesEmRiscoDetalhes, loading }: AlertCardsProps) => {
  // Format date to Brazilian format (day/month/year)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };
  
  // Format singular/plural text correctly
  const getClientText = (count: number) => {
    return count === 1 ? "cliente ficará inativo" : "clientes ficarão inativos";
  };
  
  const getAppText = (count: number) => {
    return count === 1 ? "aplicativo vencerá" : "aplicativos vencerão";
  };
  
  const getDayText = (days: number) => {
    if (days === 0) return "hoje";
    return days === 1 ? "amanhã" : `em ${days} dias`;
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Clients becoming inactive card */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Clientes em risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div>
              {clientesEmRiscoDetalhes && clientesEmRiscoDetalhes.length > 0 ? (
                <div>
                  <p className="font-medium mb-2 text-amber-800 dark:text-amber-300">
                    {clientesEmRiscoDetalhes.length} {getClientText(clientesEmRiscoDetalhes.length)} nos próximos 3 dias
                  </p>
                  <div className="text-sm space-y-1 max-h-32 overflow-y-auto pr-1">
                    {clientesEmRiscoDetalhes.slice(0, 4).map((cliente, index) => (
                      <div key={index} className="flex justify-between border-b pb-1">
                        <span className="font-medium">{cliente.nome}</span>
                        <div>
                          <span className="text-muted-foreground">{cliente.servidor}</span>
                          <span className="ml-2 text-amber-600 dark:text-amber-400">
                            {getDayText(cliente.dias_restantes)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {clientesEmRiscoDetalhes.length > 4 && (
                      <p className="text-center text-muted-foreground text-xs pt-1">
                        + {clientesEmRiscoDetalhes.length - 4} {clientesEmRiscoDetalhes.length - 4 === 1 ? 'outro' : 'outros'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <Alert variant="default" className="bg-amber-50 dark:bg-amber-950/20">
                  <AlertTitle className="text-amber-800 dark:text-amber-300">
                    Nenhum cliente ficará inativo nos próximos 3 dias
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Todos os clientes estão com os pagamentos em dia.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Apps expiring card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500" />
            Licenças vencendo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div>
              {appsVencendo && appsVencendo.length > 0 ? (
                <div>
                  <p className="font-medium mb-2 text-blue-800 dark:text-blue-300">
                    {appsVencendo.length} {getAppText(appsVencendo.length)} nos próximos 30 dias
                  </p>
                  <div className="text-sm space-y-1 max-h-32 overflow-y-auto pr-1">
                    {appsVencendo.slice(0, 4).map((app, index) => (
                      <div key={index} className="flex justify-between border-b pb-1">
                        <span className="font-medium">{app.nome}</span>
                        <div>
                          <span className="text-muted-foreground">{app.aplicativo} ({app.tipo_tela})</span>
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            {app.dias_restantes} {app.dias_restantes === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {appsVencendo.length > 4 && (
                      <p className="text-center text-muted-foreground text-xs pt-1">
                        + {appsVencendo.length - 4} {appsVencendo.length - 4 === 1 ? 'outro' : 'outros'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/20">
                  <AlertTitle className="text-blue-800 dark:text-blue-300">
                    Nenhuma licença vencerá nos próximos 30 dias
                  </AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Todas as licenças estão com vencimento além de 30 dias.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
