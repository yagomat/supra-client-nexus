
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { getClientes, getPagamentos, createPagamento, updatePagamento } from "@/services/supabaseService";
import { Cliente, Pagamento, PaymentStatus } from "@/types";
import { Search, X, Loader2 } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

type PaymentStatusOption = {
  value: PaymentStatus;
  label: string;
  className: string;
};

const paymentStatusOptions: PaymentStatusOption[] = [
  { value: "nao_pago", label: "Não Pago", className: "payment-unpaid" },
  { value: "pago", label: "Pago", className: "payment-paid" },
  { value: "pago_confianca", label: "Pago (confiança)", className: "payment-trusted" },
];

const meses = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const anos = [2023, 2024, 2025, 2026, 2027];

interface ClienteComPagamentos extends Cliente {
  pagamentos: Record<string, Pagamento | undefined>;
}

const GestaoPagamentos = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientesComPagamentos, setClientesComPagamentos] = useState<ClienteComPagamentos[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [filteredClientes, setFilteredClientes] = useState<ClienteComPagamentos[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clientesData = await getClientes();
        const pagamentosData = await getPagamentos();
        
        setClientes(clientesData);
        setPagamentos(pagamentosData);
        
      } catch (error) {
        console.error("Erro ao buscar dados", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao buscar clientes e pagamentos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    // Processar clientes e pagamentos
    const clientesPagamentos = clientes.map((cliente) => {
      const clientePagamentos: Record<string, Pagamento | undefined> = {};
      
      // Inicializar todos os meses do ano atual
      meses.forEach((mes) => {
        const chave = `${mes.value}-${anoAtual}`;
        clientePagamentos[chave] = undefined;
      });
      
      // Adicionar pagamentos existentes
      pagamentos
        .filter((p) => p.cliente_id === cliente.id && p.ano === anoAtual)
        .forEach((pagamento) => {
          const chave = `${pagamento.mes}-${pagamento.ano}`;
          clientePagamentos[chave] = pagamento;
        });
      
      return {
        ...cliente,
        pagamentos: clientePagamentos,
      } as ClienteComPagamentos;
    });
    
    setClientesComPagamentos(clientesPagamentos);
    setFilteredClientes(clientesPagamentos);
  }, [clientes, pagamentos, anoAtual]);

  useEffect(() => {
    // Filtrar por termo de busca
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientesComPagamentos);
    } else {
      const filtered = clientesComPagamentos.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
          (cliente.uf && cliente.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientesComPagamentos]);

  const handleLimparFiltro = () => {
    setSearchTerm("");
  };

  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: PaymentStatus) => {
    try {
      setSubmitting(true);
      
      const chave = `${mes}-${ano}`;
      const pagamentoExistente = cliente.pagamentos[chave];
      
      if (pagamentoExistente) {
        // Atualizar pagamento existente
        await updatePagamento(pagamentoExistente.id, status);
        
        // Atualizar estado local
        setPagamentos((prev) =>
          prev.map((p) => (p.id === pagamentoExistente.id ? { ...p, status } : p))
        );
        
        toast({
          title: "Status atualizado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} atualizado com sucesso.`,
        });
      } else {
        // Criar novo pagamento
        const novoPagamento = {
          cliente_id: cliente.id,
          mes,
          ano,
          status,
          data_pagamento: status !== "nao_pago" ? new Date().toISOString() : null,
        };
        
        const pagamentoCriado = await createPagamento(novoPagamento);
        
        // Atualizar estado local
        setPagamentos((prev) => [...prev, pagamentoCriado]);
        
        toast({
          title: "Pagamento registrado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} registrado com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do pagamento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus | undefined) => {
    if (!status) return <Badge variant="outline">Não Registrado</Badge>;
    
    const option = paymentStatusOptions.find((o) => o.value === status);
    if (!option) return null;
    
    return (
      <Badge variant="outline" className={option.className}>
        {option.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Pagamentos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os pagamentos dos clientes e acompanhe seu status.
          </p>
        </div>

        <Tabs defaultValue="lista">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="matriz">Matriz</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Select
                value={anoAtual.toString()}
                onValueChange={(value) => setAnoAtual(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {anos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <TabsContent value="lista" className="mt-0">
                <Select
                  value={mesAtual.toString()}
                  onValueChange={(value) => setMesAtual(parseInt(value))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((mes) => (
                      <SelectItem key={mes.value} value={mes.value.toString()}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </div>

            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={handleLimparFiltro}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
              <span className="text-lg">Carregando...</span>
            </div>
          ) : (
            <>
              <TabsContent value="lista" className="pt-2">
                <div className="border rounded-md overflow-hidden">
                  {filteredClientes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-lg text-muted-foreground">Nenhum cliente encontrado.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data de Cadastro</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>UF</TableHead>
                            <TableHead>Servidor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Pagamento ({meses.find((m) => m.value === mesAtual)?.label}/{anoAtual})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClientes.map((cliente) => {
                            const chave = `${mesAtual}-${anoAtual}`;
                            const pagamento = cliente.pagamentos[chave];
                            
                            return (
                              <TableRow key={cliente.id}>
                                <TableCell>{formatDate(cliente.created_at)}</TableCell>
                                <TableCell className="font-medium">{cliente.nome}</TableCell>
                                <TableCell>{cliente.telefone || "-"}</TableCell>
                                <TableCell>{cliente.uf || "-"}</TableCell>
                                <TableCell>{cliente.servidor}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={cliente.status === "ativo" ? "status-active" : "status-inactive"}
                                  >
                                    {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    {getStatusBadge(pagamento?.status)}
                                    <Select
                                      onValueChange={(value) => 
                                        handleChangeStatus(
                                          cliente, 
                                          mesAtual, 
                                          anoAtual, 
                                          value as PaymentStatus
                                        )
                                      }
                                      value={pagamento?.status}
                                      disabled={submitting}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Alterar status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {paymentStatusOptions.map((option) => (
                                          <SelectItem 
                                            key={option.value} 
                                            value={option.value}
                                            className={option.className}
                                          >
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="matriz" className="pt-2">
                <div className="border rounded-md overflow-hidden">
                  {filteredClientes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-lg text-muted-foreground">Nenhum cliente encontrado.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Status</TableHead>
                            {meses.map((mes) => (
                              <TableHead key={mes.value}>
                                {mes.label.substring(0, 3)}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClientes.map((cliente) => (
                            <TableRow key={cliente.id}>
                              <TableCell className="font-medium">{cliente.nome}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cliente.status === "ativo" ? "status-active" : "status-inactive"}
                                >
                                  {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                                </Badge>
                              </TableCell>
                              {meses.map((mes) => {
                                const chave = `${mes.value}-${anoAtual}`;
                                const pagamento = cliente.pagamentos[chave];
                                
                                let cellClass = "";
                                if (pagamento) {
                                  if (pagamento.status === "pago") {
                                    cellClass = "bg-success/20";
                                  } else if (pagamento.status === "pago_confianca") {
                                    cellClass = "bg-warning/20";
                                  } else if (pagamento.status === "nao_pago") {
                                    cellClass = "bg-danger/20";
                                  }
                                }
                                
                                return (
                                  <TableCell key={mes.value} className={cellClass}>
                                    <div className="flex justify-center">
                                      <Select
                                        onValueChange={(value) => 
                                          handleChangeStatus(
                                            cliente, 
                                            mes.value, 
                                            anoAtual, 
                                            value as PaymentStatus
                                          )
                                        }
                                        value={pagamento?.status}
                                        disabled={submitting}
                                      >
                                        <SelectTrigger className="w-[100px]">
                                          <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {paymentStatusOptions.map((option) => (
                                            <SelectItem 
                                              key={option.value} 
                                              value={option.value}
                                              className={option.className}
                                            >
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GestaoPagamentos;
