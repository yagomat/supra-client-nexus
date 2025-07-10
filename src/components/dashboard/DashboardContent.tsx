
import { AlertCards } from "@/components/dashboard/AlertCards";
import { ClientEvolutionChart } from "@/components/dashboard/ClientEvolutionChart";
import { PaymentEvolutionChart } from "@/components/dashboard/PaymentEvolutionChart";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DistributionCharts } from "@/components/dashboard/DistributionCharts";
import { DashboardStats } from "@/types";

interface DashboardContentProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function DashboardContent({ 
  stats, 
  loading
}: DashboardContentProps) {
  if (loading) {
    return (
      <div className="section-spacing">
        <div className="component-spacing">
          <Card className="card-standard">
            <CardContent className="p-6">
              <div className="grid gap-4">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-4 w-[400px]" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="card-standard">
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Skeleton className="h-64" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="section-spacing">
        <div className="card-standard p-6 text-center">
          <p className="text-destructive">Erro ao carregar dados do dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-spacing animate-fade-in">
      <div className="animate-slide-up component-spacing">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="section-title">Visão Geral</h2>
            <p className="section-description">
              Acompanhe o desempenho dos seus clientes e pagamentos
            </p>
          </div>
        </div>

        <StatsCards 
          data={{
            totalClientes: stats.clientes_total,
            totalFaturamento: stats.valor_recebido_mes,
            percentualCrescimento: 0,
            ticketMedio: stats.clientes_total > 0 ? stats.valor_recebido_mes / stats.clientes_total : 0
          }} 
        />
        
        <AlertCards 
          clientesInativos={stats.clientes_inativos_proximos_dias}
          appsVencendo={stats.apps_vencendo_proximos_dias}
          clientesEmRiscoDetalhes={stats.clientes_em_risco_detalhes || []}
          loading={loading}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 element-spacing">
          <ClientEvolutionChart 
            data={stats.evolucao_clientes.map(item => ({
              mes: item.mes,
              quantidade: item.quantidade
            }))} 
            loading={loading}
          />
          <PaymentEvolutionChart 
            data={stats.pagamentos_por_mes?.map(item => ({
              mes: item.mes,
              valor: item.valor
            })) || []} 
            loading={loading}
          />
        </div>
        
        <DistributionCharts 
          stats={stats} 
          loading={loading}
        />
      </div>
    </div>
  );
}
