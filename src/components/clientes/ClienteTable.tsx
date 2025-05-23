
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Cliente } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { TablePagination } from "../table/TablePagination";

interface ClienteTableProps {
  clientes: Cliente[];
  verDetalhes: (cliente: Cliente) => void;
  verTelaAdicional: (cliente: Cliente) => void;
  verObservacoes: (cliente: Cliente) => void;
  confirmarExclusao: (clienteId: string) => void;
  sortOrder?: 'nome' | 'data';
  onSortChange?: (sortOrder: 'nome' | 'data') => void;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export const ClienteTable = ({
  clientes,
  verDetalhes,
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao,
  sortOrder = 'data',
  onSortChange,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange
}: ClienteTableProps) => {
  const navigate = useNavigate();
  
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

  // Calcular o número total de páginas
  const totalPages = Math.ceil(clientes.length / itemsPerPage);
  
  // Obter os clientes da página atual
  const paginatedClientes = clientes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSortChange('data')} className="cursor-pointer">
                <div className="flex items-center">
                  Data de Cadastro
                  {onSortChange && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  {sortOrder === 'data' && <span className="ml-1 text-primary">•</span>}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSortChange('nome')} className="cursor-pointer">
                <div className="flex items-center">
                  Nome
                  {onSortChange && <ArrowUpDown className="ml-1 h-4 w-4" />}
                  {sortOrder === 'nome' && <span className="ml-1 text-primary">•</span>}
                </div>
              </TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Servidor</TableHead>
              <TableHead className="whitespace-pre-line">Dia de{'\n'}Venc.</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tela Principal</TableHead>
              <TableHead>Tela Adicional</TableHead>
              <TableHead>Obs.</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{formatDate(cliente.created_at)}</TableCell>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
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
        </Table>
      </div>
      
      {/* Componente de paginação */}
      {onPageChange && onItemsPerPageChange && (
        <div className="border-t p-2">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
};
