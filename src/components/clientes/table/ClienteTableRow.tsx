
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

  const isEven = index % 2 === 0;
  const rowBgClass = isEven ? "bg-background" : "bg-muted/10";
  // Sempre usar fundo sólido para a coluna nome
  const nameCellBgClass = isEven ? "bg-background" : "bg-muted/90";

  return (
    <TableRow 
      className={rowBgClass}
    >
      <TableCell>{formatDate(cliente.created_at)}</TableCell>
      <TableCell className={`font-medium sticky left-0 ${nameCellBgClass} z-30 border-r-2 border-border shadow-xl`}>
        {cliente.nome}
      </TableCell>
      <TableCell>{formatPhoneNumber(cliente.telefone)}</TableCell>
      <TableCell>{cliente.uf || "-"}</TableCell>
      <TableCell>{cliente.servidor}</TableCell>
      <TableCell>{cliente.dia_vencimento}</TableCell>
      <TableCell>
        {cliente.valor_plano ? `R$ ${cliente.valor_plano.toFixed(2)}` : "-"}
      </TableCell>
      <TableCell>
        <ClientStatusBadge status={cliente.status} />
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
