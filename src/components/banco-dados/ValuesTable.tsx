
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";

interface ValuesTableProps {
  values: (string | number)[];
  type: string;
  onDelete: (type: string, value: string | number) => void;
  isNumeric?: boolean;
  isPlano?: boolean;
}

export const ValuesTable = ({ values, type, onDelete, isNumeric = false, isPlano = false }: ValuesTableProps) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Valor</TableHead>
            <TableHead className="text-right w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {values.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                Nenhum valor cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            values.map((value, index) => (
              <TableRow key={index}>
                <TableCell>
                  {isNumeric ? value : isPlano ? value : value}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(type, value)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
