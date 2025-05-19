
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Cliente } from "@/types";
import { formatDate } from "@/utils/dateUtils";
import { ClienteStatusBadge } from "./ClienteStatusBadge";

interface ClienteTableProps {
  clientes: Cliente[];
  verDetalhes: (cliente: Cliente) => void;
  verTelaAdicional: (cliente: Cliente) => void;
  verObservacoes: (cliente: Cliente) => void;
  confirmarExclusao: (clienteId: string) => void;
}

export const ClienteTable = ({
  clientes,
  verDetalhes,
  verTelaAdicional,
  verObservacoes,
  confirmarExclusao
}: ClienteTableProps) => {
  const navigate = useNavigate();
  
  // Função para formatar o valor do plano
  const formatarValorPlano = (valor: number | null | undefined): string => {
    if (valor === null || valor === undefined) return "-";
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  };
  
  return (
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
              <TableHead className="whitespace-normal text-center" style={{ maxWidth: "80px" }}>
                Dia de<br />Venc.
              </TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tela Principal</TableHead>
              <TableHead>Tela Adicional</TableHead>
              <TableHead>Obs.</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>{formatDate(cliente.created_at)}</TableCell>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>{cliente.telefone || "-"}</TableCell>
                <TableCell>{cliente.uf || "-"}</TableCell>
                <TableCell>{cliente.servidor}</TableCell>
                <TableCell className="text-center">{cliente.dia_vencimento}</TableCell>
                <TableCell>{formatarValorPlano(cliente.valor_plano)}</TableCell>
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
    </div>
  );
};
