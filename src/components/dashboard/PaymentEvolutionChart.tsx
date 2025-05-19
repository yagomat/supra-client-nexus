
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface PaymentEvolutionChartProps {
  data: { mes: string; valor: number }[];
  loading: boolean;
}

export const PaymentEvolutionChart = ({ data, loading }: PaymentEvolutionChartProps) => {
  const isMobile = useIsMobile();
  
  // Certifique-se de que temos dados para todos os 12 meses
  const ensureAllMonths = (originalData: { mes: string; valor: number }[]) => {
    // Se não tivermos dados, retorna um array vazio
    if (!originalData || originalData.length === 0) return [];
    
    // Extrair os meses dos dados existentes
    const existingMonths = originalData.map(item => item.mes);
    
    // Verificar se temos exatamente 12 meses
    if (existingMonths.length === 12) return originalData;
    
    // Último ano de dados (12 meses)
    const last12Months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      const yearShort = date.getFullYear().toString().slice(-2);
      const formattedMonth = `${monthName}/${yearShort}`;
      
      // Procurar este mês nos dados existentes
      const existingData = originalData.find(item => item.mes === formattedMonth);
      
      if (existingData) {
        last12Months.push(existingData);
      } else {
        last12Months.push({ mes: formattedMonth, valor: 0 });
      }
    }
    
    return last12Months;
  };
  
  // Aplicar a função para garantir todos os meses
  const completeData = ensureAllMonths(data);
  
  // Debug para verificar os dados
  console.log('Payment Evolution Chart - Original Data:', data);
  console.log('Payment Evolution Chart - Complete Data:', completeData);
  
  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`.replace('.', ',');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolução de Pagamentos (12 meses)</CardTitle>
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
                left: isMobile ? 0 : 20,
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
                width={isMobile ? 30 : 50}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} />
              <Bar dataKey="valor" name="Valor" fill="#10b981" />
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
