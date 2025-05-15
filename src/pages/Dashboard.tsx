
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/services/supabaseService";
import { DashboardStats } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error);
        toast({
          title: "Erro ao carregar o dashboard",
          description: "Não foi possível carregar as estatísticas. Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const renderStatCard = (title: string, value: number | string, icon: React.ReactNode, className?: string) => (
    <Card className={className}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <h3 className="text-3xl font-bold">{value}</h3>
          )}
        </div>
        <div className={`p-2 rounded-full ${className}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );

  // Safe getter functions to handle potential null values
  const getSafeData = (dataArray: any[] | null | undefined, defaultValue: any[] = []) => {
    return Array.isArray(dataArray) ? dataArray : defaultValue;
  };

  // Create safe versions of each data set
  const safeEvolucaoClientes = stats?.evolucao_clientes ? getSafeData(stats.evolucao_clientes) : [];
  const safeDispositivos = stats?.distribuicao_dispositivos ? getSafeData(stats.distribuicao_dispositivos) : [];
  const safeAplicativos = stats?.distribuicao_aplicativos ? getSafeData(stats.distribuicao_aplicativos) : [];
  const safeUfs = stats?.distribuicao_ufs ? getSafeData(stats.distribuicao_ufs) : [];
  const safeServidores = stats?.distribuicao_servidores ? getSafeData(stats.distribuicao_servidores) : [];

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de gestão de clientes. Aqui você encontra um resumo das suas estatísticas.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {renderStatCard(
            "Total de Clientes",
            loading ? "" : stats ? (stats.clientes_ativos || 0) + (stats.clientes_inativos || 0) : "0",
            <Users size={24} className="text-primary" />,
            "border-l-4 border-primary"
          )}
          {renderStatCard(
            "Clientes Ativos",
            loading ? "" : stats?.clientes_ativos || "0",
            <UserCheck size={24} className="text-success" />,
            "border-l-4 border-success"
          )}
          {renderStatCard(
            "Clientes Inativos",
            loading ? "" : stats?.clientes_inativos || "0",
            <UserX size={24} className="text-danger" />,
            "border-l-4 border-danger"
          )}
          {renderStatCard(
            "Clientes Novos (30 dias)",
            loading ? "" : stats?.clientes_novos || "0",
            <UserPlus size={24} className="text-warning" />,
            "border-l-4 border-warning"
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Evolução de Clientes Ativos (12 meses)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : safeEvolucaoClientes.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={safeEvolucaoClientes}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 40,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" angle={-45} textAnchor="end" />
                    <YAxis />
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

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : safeDispositivos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={safeDispositivos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="quantidade"
                        nameKey="dispositivo"
                      >
                        {safeDispositivos.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Aplicativo</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : safeAplicativos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={safeAplicativos}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="quantidade"
                        nameKey="aplicativo"
                      >
                        {safeAplicativos.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por UF</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : safeUfs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={safeUfs}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="quantidade"
                        nameKey="uf"
                      >
                        {safeUfs.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Servidor</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : safeServidores.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={safeServidores}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="quantidade"
                        nameKey="servidor"
                      >
                        {safeServidores.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
