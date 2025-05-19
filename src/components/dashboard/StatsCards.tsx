
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
        icon={<Users size={24} className="text-primary" />}
        loading={loading}
        className="border-l-4 border-primary"
      />
      <StatCard
        title="Clientes Ativos"
        value={loading ? "" : stats?.clientes_ativos || "0"}
        icon={<UserCheck size={24} className="text-success" />}
        loading={loading}
        className="border-l-4 border-success"
      />
      <StatCard
        title="Clientes Inativos"
        value={loading ? "" : stats?.clientes_inativos || "0"}
        icon={<UserX size={24} className="text-danger" />}
        loading={loading}
        className="border-l-4 border-danger"
      />
      <StatCard
        title="Clientes Novos (30 dias)"
        value={loading ? "" : stats?.clientes_novos || "0"}
        icon={<UserPlus size={24} className="text-warning" />}
        loading={loading}
        className="border-l-4 border-warning"
      />
      <StatCard
        title="Pagamentos Pendentes"
        value={loading ? "" : stats?.pagamentos_pendentes || "0"}
        icon={<AlertCircle size={24} className="text-orange-500" />}
        loading={loading}
        className="border-l-4 border-orange-500"
      />
      <StatCard
        title="Valor Recebido (Mês Atual)"
        value={loading ? "" : `R$ ${stats?.valor_recebido_mes?.toFixed(2) || "0,00"}`.replace('.', ',')}
        icon={<DollarSign size={24} className="text-green-500" />}
        loading={loading}
        className="border-l-4 border-green-500"
      />
    </div>
  );
};
