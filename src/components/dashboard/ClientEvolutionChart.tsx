
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/theme/ThemeProvider";

interface ClientEvolutionChartProps {
  data: { mes: string; quantidade: number }[];
  loading: boolean;
}

export const ClientEvolutionChart = ({ data, loading }: ClientEvolutionChartProps) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  // Custom tooltip component for dark mode compatibility
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-md border p-2 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm">
            <span>Clientes: </span>
            <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
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
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
              <XAxis 
                dataKey="mes" 
                angle={-45} 
                textAnchor="end"
                height={60}
                tick={{ fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#cbd5e1" : "#475569" }}
              />
              <YAxis 
                width={isMobile ? 30 : 40}
                tick={{ fontSize: isMobile ? 10 : 12, fill: isDarkMode ? "#cbd5e1" : "#475569" }}
              />
              <Tooltip content={<CustomTooltip />} />
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
