
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/theme/ThemeProvider";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface DistributionData {
  [key: string]: string | number;
  startAngle?: number;
  endAngle?: number;
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
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  
  // Custom label that only shows values, not percentages
  const renderCustomizedLabel = ({ x, y, cx, cy, name, value, index }: any) => {
    // Calculate position - move labels further from center for better spacing
    const radius = isMobile ? 50 : 70;
    const RADIAN = Math.PI / 180;
    
    // Safely access angle data and convert to number if necessary
    const startAngle = typeof data[index]?.startAngle === 'number' ? data[index].startAngle as number : 0;
    const endAngle = typeof data[index]?.endAngle === 'number' ? data[index].endAngle as number : 0;
    
    const middleAngle = (startAngle + endAngle) / 2;
    
    // Calculate optimal position for labels
    const posX = cx + (radius + 5) * Math.cos(-middleAngle * RADIAN);
    const posY = cy + (radius + 5) * Math.sin(-middleAngle * RADIAN);
    
    // For very small slices or on mobile, don't show labels to prevent overlap
    if (isMobile || (endAngle - startAngle) < 10) {
      return null;
    }
    
    return (
      <text 
        x={posX} 
        y={posY} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={posX > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={10}
      >
        {value}
      </text>
    );
  };

  // Custom tooltip that shows both name and quantity
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-md border p-2 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-gray-800'}`}>
          <p className="font-medium">
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
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
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={isMobile ? 60 : 80}
                dataKey={valueKey}
                nameKey={nameKey}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                layout={isMobile ? "horizontal" : "vertical"} 
                verticalAlign={isMobile ? "bottom" : "middle"} 
                align={isMobile ? "center" : "right"} 
                formatter={(value, entry, index) => {
                  // Truncate long names to prevent overflow
                  const maxLength = isMobile ? 10 : 15;
                  const displayName = value.length > maxLength ? 
                    `${value.substring(0, maxLength)}...` : value;
                  return <span className={`text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{displayName}</span>;
                }}
                wrapperStyle={{ fontSize: '10px' }}
              />
              <Tooltip content={<CustomTooltip />} />
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
