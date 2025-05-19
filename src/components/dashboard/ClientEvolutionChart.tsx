
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClientEvolutionChartProps {
  data: { mes: string; quantidade: number }[];
  loading: boolean;
}

export const ClientEvolutionChart = ({ data, loading }: ClientEvolutionChartProps) => {
  const isMobile = useIsMobile();
  
  // Ensure we have data for all 12 months
  const ensureAllMonths = (originalData: { mes: string; quantidade: number }[]) => {
    // If we don't have data, return an empty array
    if (!originalData || originalData.length === 0) return [];
    
    // Define month name format for consistent comparison
    const formatMonthKey = (monthStr: string): string => {
      return monthStr.toLowerCase().replace('.', '');
    };

    // Create a map of existing data for faster lookup
    const dataMap = new Map<string, number>();
    originalData.forEach(item => {
      dataMap.set(formatMonthKey(item.mes), item.quantidade);
    });

    // Last 12 months
    const last12Months = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      const yearShort = date.getFullYear().toString().slice(-2);
      const formattedMonth = `${monthName}/${yearShort}`;
      const monthKey = formatMonthKey(formattedMonth);
      
      // Check if we have data for this month
      if (dataMap.has(monthKey)) {
        const quantity = dataMap.get(monthKey);
        last12Months.push({ 
          mes: formattedMonth, 
          quantidade: quantity 
        });
      } else {
        // Check alternative format (e.g., Jan/25 vs jan./25)
        // This is a fallback for format differences
        let found = false;
        originalData.forEach(item => {
          // Try to match month regardless of format differences
          const itemMonth = item.mes.split('/')[0].toLowerCase().replace('.', '');
          const currentMonth = formattedMonth.split('/')[0].toLowerCase().replace('.', '');
          const itemYear = item.mes.split('/')[1];
          const currentYear = formattedMonth.split('/')[1];
          
          if (itemMonth === currentMonth && itemYear === currentYear) {
            last12Months.push(item);
            found = true;
          }
        });
        
        if (!found) {
          last12Months.push({ mes: formattedMonth, quantidade: 0 });
        }
      }
    }
    
    return last12Months;
  };
  
  // Apply the function to ensure all months
  const completeData = ensureAllMonths(data);
  
  // Debug to verify the data
  console.log('Client Evolution Chart - Original Data:', JSON.stringify(data, null, 2));
  console.log('Client Evolution Chart - Complete Data:', JSON.stringify(completeData, null, 2));
  
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
        ) : completeData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={completeData}
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
              <Bar dataKey="quantidade" name="Clientes Ativos" fill="#3b82f6" />
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
