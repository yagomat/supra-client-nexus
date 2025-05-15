
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientes, deleteCliente } from "@/services/supabaseService";
import { Cliente } from "@/types";
import { Eye, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

const ListaClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTelaAdicionaModalOpen, setIsTelaAdicionaModalOpen] = useState(false);
  const [isObservacoesModalOpen, setIsObservacoesModalOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const data = await getClientes();
        setClientes(data);
        setFilteredClientes(data);
      } catch (error) {
        console.error("Erro ao buscar clientes", error);
        toast({
          title: "Erro ao carregar clientes",
          description: "Ocorreu um erro ao buscar a lista de clientes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [toast]);

  useEffect(() => {
    // Aplicar filtros
    let results = [...clientes];
    
    if (searchTerm) {
      results = results.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
          (cliente.uf && cliente.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.observacoes && cliente.observacoes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== "todos") {
      results = results.filter((cliente) => cliente.status === statusFilter);
    }
    
    setFilteredClientes(results);
  }, [searchTerm, statusFilter, clientes]);

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setStatusFilter("todos");
  };

  const verDetalhes = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsViewModalOpen(true);
  };

  const verTelaAdicional = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsTelaAdicionaModalOpen(true);
  };

  const verObservacoes = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsObservacoesModalOpen(true);
  };

  const confirmarExclusao = (clienteId: string) => {
    setClienteParaExcluir(clienteId);
  };

  const handleExcluir = async () => {
    if (!clienteParaExcluir) return;

    try {
      await deleteCliente(clienteParaExcluir);
      
      // Atualizar a lista de clientes
      setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteParaExcluir));
      
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir cliente", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setClienteParaExcluir(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight">Lista de Clientes</h1>
          <Button
            onClick={() => navigate("/clientes/cadastrar")}
          >
            Cadastrar Cliente
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "todos" | "ativo" | "inativo")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleLimparFiltros}>
            Limpar Filtros
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Carregando...</span>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
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
                    <TableHead>Tela Principal</TableHead>
                    <TableHead>Tela Adicional</TableHead>
                    <TableHead>Obs.</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => verDetalhes(cliente)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        {cliente.possui_tela_adicional ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => verTelaAdicional(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {cliente.observacoes ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => verObservacoes(cliente)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmarExclusao(cliente.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Modal para visualizar detalhes da tela principal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Tela Principal</DialogTitle>
          </DialogHeader>
          {clienteDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dispositivo Smart</p>
                  <p>{clienteDetalhes.dispositivo_smart || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aplicativo</p>
                  <p>{clienteDetalhes.aplicativo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuário</p>
                  <p>{clienteDetalhes.usuario_aplicativo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senha</p>
                  <p>{clienteDetalhes.senha_aplicativo}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data da Licença</p>
                  <p>{clienteDetalhes.data_licenca_aplicativo ? formatDate(clienteDetalhes.data_licenca_aplicativo) : "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar detalhes da tela adicional */}
      <Dialog open={isTelaAdicionaModalOpen} onOpenChange={setIsTelaAdicionaModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Tela Adicional</DialogTitle>
          </DialogHeader>
          {clienteDetalhes && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dispositivo Smart 2</p>
                  <p>{clienteDetalhes.dispositivo_smart_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aplicativo 2</p>
                  <p>{clienteDetalhes.aplicativo_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuário 2</p>
                  <p>{clienteDetalhes.usuario_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Senha 2</p>
                  <p>{clienteDetalhes.senha_2 || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data da Licença 2</p>
                  <p>{clienteDetalhes.data_licenca_2 ? formatDate(clienteDetalhes.data_licenca_2) : "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar observações */}
      <Dialog open={isObservacoesModalOpen} onOpenChange={setIsObservacoesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Observações</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{clienteDetalhes?.observacoes}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!clienteParaExcluir} onOpenChange={(open) => !open && setClienteParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluir}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ListaClientes;
