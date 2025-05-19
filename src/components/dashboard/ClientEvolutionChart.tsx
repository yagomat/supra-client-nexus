
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientEvolutionChartProps {
  data: { mes: string; quantidade: number }[];
  loading: boolean;
}

// Helper function to get month name from number
const getMonthName = (monthNumber: number): string => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('pt-BR', { month: 'short' }).charAt(0).toUpperCase() + date.toLocaleString('pt-BR', { month: 'short' }).slice(1);
};

// Generate last 12 months data
const generateLast12Months = () => {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    
    const monthNumber = date.getMonth() + 1;
    const monthName = getMonthName(monthNumber);
    
    months.push({
      monthNumber,
      monthName,
      mes: monthName,
      quantidade: 0
    });
  }
  
  return months;
};

export const ClientEvolutionChart = ({ data, loading }: ClientEvolutionChartProps) => {
  const isMobile = useIsMobile();
  
  // Create complete dataset with all 12 months
  const completeData = () => {
    const last12Months = generateLast12Months();
    
    // Merge existing data with the 12 month template
    if (data && data.length > 0) {
      data.forEach(item => {
        // Find the matching month in our template
        const monthIndex = last12Months.findIndex(m => 
          m.mes.toLowerCase() === item.mes.toLowerCase()
        );
        
        if (monthIndex !== -1) {
          // Update the quantity if the month is found
          last12Months[monthIndex].quantidade = item.quantidade;
        }
      });
    }
    
    return last12Months;
  };
  
  const chartData = completeData();
  
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
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
              <Bar dataKey="quantidade" fill="#3b82f6" />
            </BarChart>
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
