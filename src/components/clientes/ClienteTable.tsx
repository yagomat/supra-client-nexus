
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Cliente } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTheme } from "next-themes";

interface ClienteTableProps {
  clientes: Cliente[];
  verDetalhes: (cliente: Cliente) => void;
  verTelaAdicional: (cliente: Cliente) => void;
  verObservacoes: (cliente: Cliente) => void;
  confirmarExclusao: (clienteId: string) => void;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
}

export const ClienteTable = ({
  clientes,
  verDetalhes,
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao,
  sortOrder = 'data',
  onSortChange
}: ClienteTableProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const handleSortChange = (field: 'nome' | 'data') => {
    if (onSortChange) {
      onSortChange(field);
    }
  };
  
  // Format phone number for display
  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return "-";
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  // Paginação
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedClientes = clientes.slice(startIndex, startIndex + pageSize);
  
  // Manipular mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Manipular mudança de tamanho da página
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Voltar para a primeira página ao mudar o tamanho
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <ScrollableTable fixedColumns={2} className={theme === 'dark' ? 'table-dark' : ''}>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSortChange('data')} className="cursor-pointer fixed-column-1 min-w-[130px]">
              <div className="flex items-center">
                Data de Cadastro
                {onSortChange && <ArrowUpDown className="ml-1 h-4 w-4" />}
                {sortOrder === 'data' && <span className="ml-1 text-primary">•</span>}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSortChange('nome')} className="cursor-pointer fixed-column-2 min-w-[180px]">
              <div className="flex items-center">
                Nome
                {onSortChange && <ArrowUpDown className="ml-1 h-4 w-4" />}
                {sortOrder === 'nome' && <span className="ml-1 text-primary">•</span>}
              </div>
            </TableHead>
            <TableHead className="min-w-[140px]">Telefone</TableHead>
            <TableHead className="min-w-[60px]">UF</TableHead>
            <TableHead className="min-w-[120px]">Servidor</TableHead>
            <TableHead className="whitespace-pre-line min-w-[80px]">Dia de{'\n'}Venc.</TableHead>
            <TableHead className="min-w-[100px]">Plano</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[80px]">Tela Principal</TableHead>
            <TableHead className="min-w-[80px]">Tela Adicional</TableHead>
            <TableHead className="min-w-[60px]">Obs.</TableHead>
            <TableHead className="min-w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedClientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell className="fixed-column-1">{formatDate(cliente.created_at)}</TableCell>
              <TableCell className="font-medium fixed-column-2">{cliente.nome}</TableCell>
              <TableCell>{formatPhoneNumber(cliente.telefone)}</TableCell>
              <TableCell>{cliente.uf || "-"}</TableCell>
              <TableCell>{cliente.servidor}</TableCell>
              <TableCell>{cliente.dia_vencimento}</TableCell>
              <TableCell>
                {cliente.valor_plano ? `R$ ${cliente.valor_plano.toFixed(2)}` : "-"}
              </TableCell>
              <TableCell>
                <ClienteStatusBadge status={cliente.status} />
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
      </ScrollableTable>
      
      <TablePagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={clientes.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
