import { AlertCards } from "@/components/dashboard/AlertCards";
import { ClientEvolutionChart } from "@/components/dashboard/ClientEvolutionChart";
import { PaymentEvolutionChart } from "@/components/dashboard/PaymentEvolutionChart";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DistributionCharts } from "@/components/dashboard/DistributionCharts";

interface DashboardData {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  totalRevenue: number;
  newClients: number;
  paymentEvolution: { date: string; value: number }[];
  evolutionData: { date: string; active: number; inactive: number }[];
  paymentDistribution: { status: string; count: number }[];
  clientDistribution: { status: string; count: number }[];
  alerts: { type: string; message: string }[];
}

interface DashboardContentProps {
  data: DashboardData | null;
  isLoading: boolean;
  error: any;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateRangeChange: (date: { from: Date | undefined; to: Date | undefined }) => void;
}

export function DashboardContent({ 
  data, 
  isLoading, 
  error,
  dateRange,
  onDateRangeChange 
}: DashboardContentProps) {
  if (isLoading) {
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

  if (error) {
    return (
      <div className="section-spacing">
        <div className="card-standard p-6 text-center">
          <p className="text-destructive">Erro ao carregar dados do dashboard</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
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
          
          <div className="mt-4 sm:mt-0">
            <DateRangePicker date={dateRange} onDateChange={onDateRangeChange} />
          </div>
        </div>

        <StatsCards data={data} />
        
        <AlertCards data={data} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 element-spacing">
          <ClientEvolutionChart data={data.evolutionData} />
          <PaymentEvolutionChart data={data.paymentEvolution} />
        </div>
        
        <DistributionCharts data={data} />
      </div>
    </div>
  );
}
