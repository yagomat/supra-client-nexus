
import { StatCard } from "./StatCard";
import { Users, UserCheck, UserX, UserPlus, AlertCircle, DollarSign } from "lucide-react";
import { DashboardStats } from "@/types";
import { useSafeDashboardData, formatUtils } from "@/utils/dashboardUtils";

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  const {
    safeClientesTotal,
    safeClientesAtivos,
    safeClientesInativosTotal,
    safeClientesNovos,
    safePagamentosPendentes,
    safeValorRecebidoMes
  } = useSafeDashboardData(stats);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total de Clientes"
        value={loading ? "" : safeClientesTotal.toString()}
        icon={<Users size={24} />}
        loading={loading}
      />
      <StatCard
        title="Clientes Ativos"
        value={loading ? "" : safeClientesAtivos.toString()}
        icon={<UserCheck size={24} />}
        loading={loading}
      />
      <StatCard
        title="Clientes Inativos"
        value={loading ? "" : safeClientesInativosTotal.toString()}
        icon={<UserX size={24} />}
        loading={loading}
      />
      <StatCard
        title="Clientes Novos (30 dias)"
        value={loading ? "" : safeClientesNovos.toString()}
        icon={<UserPlus size={24} />}
        loading={loading}
      />
      <StatCard
        title="Pagamentos Pendentes (Mês Atual)"
        value={loading ? "" : safePagamentosPendentes.toString()}
        icon={<AlertCircle size={24} />}
        loading={loading}
      />
      <StatCard
        title="Valor Recebido (Mês Atual)"
        value={loading ? "" : formatUtils.formatCurrency(safeValorRecebidoMes)}
        icon={<DollarSign size={24} />}
        loading={loading}
      />
    </div>
  );
};
