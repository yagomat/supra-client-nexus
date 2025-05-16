
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface DistributionData {
  [key: string]: string | number;
}

interface DistributionPieChartProps {
  title: string;
  data: DistributionData[];
  loading: boolean;
  nameKey: string;
  valueKey?: string;
}

export const DistributionPieChart = ({ 
  title, 
  data, 
  loading, 
  nameKey, 
  valueKey = "quantidade" 
}: DistributionPieChartProps) => {
  const isMobile = useIsMobile();
  
  const renderCustomizedLabel = ({ name, percent }: any) => {
    // For mobile, show only the percentage if the name is too long
    if (isMobile && name.length > 10) {
      return `${(percent * 100).toFixed(0)}%`;
    }
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={`${isMobile ? 'h-[200px]' : 'h-[250px]'}`}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={!isMobile}
                label={renderCustomizedLabel}
                outerRadius={isMobile ? 60 : 80}
                dataKey={valueKey}
                nameKey={nameKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend layout={isMobile ? "horizontal" : "vertical"} verticalAlign={isMobile ? "bottom" : "middle"} align={isMobile ? "center" : "right"} />
            </PieChart>
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
