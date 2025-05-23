
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientEvolutionChartProps {
  data: { mes: string; quantidade: number }[];
  loading: boolean;
}

export const ClientEvolutionChart = ({ data, loading }: ClientEvolutionChartProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolução de Clientes Ativos (12 meses)</CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-[250px]' : 'h-[300px]'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: isMobile ? 10 : 20,
                left: isMobile ? 0 : 0,
                bottom: isMobile ? 60 : 40,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mes" 
                angle={-45} 
                textAnchor="end"
                height={60}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis 
                width={isMobile ? 30 : 40}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="quantidade" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </CardContent>
    </Card>
  );
};
