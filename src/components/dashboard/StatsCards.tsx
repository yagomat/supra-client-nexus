
import { StatCard } from "./StatCard";
import { Users, UserCheck, UserX, UserPlus, AlertCircle, DollarSign } from "lucide-react";
import { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total de Clientes"
        value={loading ? "" : stats?.clientes_total || "0"}
        icon={<Users size={24} className="text-white" />}
        loading={loading}
        className="bg-primary text-primary-foreground"
      />
      <StatCard
        title="Clientes Ativos"
        value={loading ? "" : stats?.clientes_ativos || "0"}
        icon={<UserCheck size={24} className="text-white" />}
        loading={loading}
        className="bg-success text-success-foreground"
      />
      <StatCard
        title="Clientes Inativos"
        value={loading ? "" : stats?.clientes_inativos || "0"}
        icon={<UserX size={24} className="text-white" />}
        loading={loading}
        className="bg-danger text-danger-foreground"
      />
      <StatCard
        title="Clientes Novos (30 dias)"
        value={loading ? "" : stats?.clientes_novos || "0"}
        icon={<UserPlus size={24} className="text-white" />}
        loading={loading}
        className="bg-warning text-warning-foreground"
      />
      <StatCard
        title="Pagamentos Pendentes"
        value={loading ? "" : stats?.pagamentos_pendentes || "0"}
        icon={<AlertCircle size={24} className="text-white" />}
        loading={loading}
        className="bg-orange-500 text-white"
      />
      <StatCard
        title="Valor Recebido (Mês Atual)"
        value={loading ? "" : `R$ ${stats?.valor_recebido_mes?.toFixed(2) || "0,00"}`.replace('.', ',')}
        icon={<DollarSign size={24} className="text-white" />}
        loading={loading}
        className="bg-green-500 text-white"
      />
    </div>
  );
};
