
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Cliente } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { ClienteStatusBadge } from "../ClienteStatusBadge";
import { formatPhoneNumber } from "./PhoneFormatter";

interface ClienteTableRowProps {
  cliente: Cliente;
  index: number;
  verDetalhes: (cliente: Cliente) => void;
  verTelaAdicional: (cliente: Cliente) => void;
  verObservacoes: (cliente: Cliente) => void;
  confirmarExclusao: (clienteId: string) => void;
}

export const ClienteTableRow = ({
  cliente,
  index,
  verDetalhes,
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao
}: ClienteTableRowProps) => {
  const navigate = useNavigate();

  return (
    <TableRow 
      className={index % 2 === 0 ? "bg-background" : "bg-muted/10"}
    >
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
          className="rounded-full hover:bg-primary/10"
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
            className="rounded-full hover:bg-primary/10"
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
            className="rounded-full hover:bg-primary/10"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
            className="rounded-full hover:bg-primary/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => confirmarExclusao(cliente.id)}
            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
