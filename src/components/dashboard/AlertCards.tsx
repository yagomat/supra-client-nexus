
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Calendar, Clock, Server } from "lucide-react";
import { AppVencendo, ClienteEmRisco } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertCardsProps {
  clientesInativos: number;
  appsVencendo: AppVencendo[];
  clientesEmRisco?: ClienteEmRisco[];
  loading: boolean;
}

export const AlertCards = ({ clientesInativos, appsVencendo, clientesEmRisco = [], loading }: AlertCardsProps) => {
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
            <>
              {clientesEmRisco && clientesEmRisco.length > 0 ? (
                <div>
                  <p className="font-medium mb-2 text-amber-800 dark:text-amber-300">
                    {clientesEmRisco.length} {getClientText(clientesEmRisco.length)} nos próximos 3 dias
                  </p>
                  <div className="text-sm space-y-1 max-h-40 overflow-y-auto pr-1">
                    {clientesEmRisco.map((cliente, index) => (
                      <div key={index} className="flex justify-between border-b pb-1 pt-1">
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente.nome}</span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Server className="h-3 w-3 mr-1" />
                            <span>{cliente.servidor}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400">
                            {cliente.dias_restantes} {cliente.dias_restantes === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/20">
                  <AlertTitle className="text-amber-800 dark:text-amber-300">
                    {clientesInativos > 0 ? (
                      <span className="font-bold">{clientesInativos} {getClientText(clientesInativos)} nos próximos 3 dias</span>
                    ) : (
                      "Nenhum cliente ficará inativo nos próximos 3 dias"
                    )}
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    {clientesInativos > 0 ? 
                      "Clientes que não pagaram o mês atual e se aproximam da data de vencimento." : 
                      "Todos os clientes estão com os pagamentos em dia."}
                  </AlertDescription>
                </Alert>
              )}
            </>
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
                  <div className="text-sm space-y-1 max-h-40 overflow-y-auto pr-1">
                    {appsVencendo.slice(0, 6).map((app, index) => (
                      <div key={index} className="flex justify-between border-b pb-1 pt-1">
                        <div className="flex flex-col">
                          <span className="font-medium">{app.nome}</span>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{app.aplicativo} ({app.tipo_tela})</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400">
                            {app.dias_restantes} {app.dias_restantes === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {appsVencendo.length > 6 && (
                      <p className="text-center text-muted-foreground text-xs pt-1">
                        + {appsVencendo.length - 6} {appsVencendo.length - 6 === 1 ? 'outro' : 'outros'}
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
