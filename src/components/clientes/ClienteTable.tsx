
import { Cliente } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { ClienteListHeader } from "./ClienteListHeader";
import { formatDate } from "@/utils/dateUtils";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { Skeleton } from "../ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClienteTableProps {
  clientes: Cliente[];
  onSortChange: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onDelete: (id: string) => void;
}

export const ClienteTable = ({
  clientes,
  onSortChange,
  sortColumn,
  sortDirection,
  onDelete,
}: ClienteTableProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleViewAndEdit = (id: string) => {
    navigate(`/editar-cliente/${id}`);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  if (clientes.length === 0) {
    return (
      <Table>
        <ClienteListHeader
          onSortChange={onSortChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          isMobile={isMobile}
        />
        <TableBody>
          <TableRow>
            <TableCell colSpan={isMobile ? 5 : 6} className="h-24 text-center">
              <Skeleton className="h-6 w-full max-w-[500px] mx-auto" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <ClienteListHeader
        onSortChange={onSortChange}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        isMobile={isMobile}
      />
      <TableBody>
        {clientes.map((cliente) => (
          <TableRow key={cliente.id} className="cursor-pointer hover:bg-muted/50">
            {!isMobile && (
              <TableCell
                className="font-medium"
                onClick={() => handleViewAndEdit(cliente.id)}
              >
                {formatDate(cliente.created_at)}
              </TableCell>
            )}
            <TableCell onClick={() => handleViewAndEdit(cliente.id)}>
              {cliente.nome}
            </TableCell>
            <TableCell onClick={() => handleViewAndEdit(cliente.id)}>
              {cliente.dia_vencimento}
            </TableCell>
            <TableCell onClick={() => handleViewAndEdit(cliente.id)}>
              {cliente.valor_plano ? `R$ ${cliente.valor_plano.toString().replace(".", ",")}` : "-"}
            </TableCell>
            <TableCell onClick={() => handleViewAndEdit(cliente.id)}>
              <ClienteStatusBadge status={cliente.status || "inativo"} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewAndEdit(cliente.id)}>
                    Visualizar/Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(cliente.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
