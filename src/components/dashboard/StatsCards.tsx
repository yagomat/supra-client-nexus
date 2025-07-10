import {
  ArrowDown,
  ArrowUp,
  Users,
  DollarSign,
  PercentCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

interface StatsCardsProps {
  data: {
    totalClientes: number;
    totalFaturamento: number;
    percentualCrescimento: number;
    ticketMedio: number;
  };
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Total de Clientes",
      value: data.totalClientes,
      icon: <Users className="h-5 w-5 text-primary" />,
      trend: "up",
      trendValue: data.percentualCrescimento,
      trendIcon: data.percentualCrescimento >= 0 ? <ArrowUp className="h-3 w-3 text-success" /> : <ArrowDown className="h-3 w-3 text-danger" />,
      description: "Clientes ativos",
    },
    {
      title: "Faturamento Total",
      value: data.totalFaturamento,
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      trend: "up",
      trendValue: data.percentualCrescimento,
      trendIcon: data.percentualCrescimento >= 0 ? <ArrowUp className="h-3 w-3 text-success" /> : <ArrowDown className="h-3 w-3 text-danger" />,
      description: "Faturamento total",
    },
    {
      title: "Crescimento",
      value: data.percentualCrescimento,
      icon: <PercentCircle className="h-5 w-5 text-primary" />,
      trend: data.percentualCrescimento >= 0 ? "up" : "down",
      trendValue: data.percentualCrescimento,
      trendIcon: data.percentualCrescimento >= 0 ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-danger" />,
      description: "Comparado com o mês anterior",
    },
    {
      title: "Ticket Médio",
      value: data.ticketMedio,
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      trend: "up",
      trendValue: data.percentualCrescimento,
      trendIcon: data.percentualCrescimento >= 0 ? <ArrowUp className="h-3 w-3 text-success" /> : <ArrowDown className="h-3 w-3 text-danger" />,
      description: "Valor médio por cliente",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 element-spacing mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}
