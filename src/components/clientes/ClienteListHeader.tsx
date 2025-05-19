
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

interface ClienteListHeaderProps {
  onSortChange: (column: string) => void;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  isMobile: boolean;
}

export const ClienteListHeader = ({
  onSortChange,
  sortColumn,
  sortDirection,
  isMobile,
}: ClienteListHeaderProps) => {
  const renderSortIndicator = (column: string) => {
    if (sortColumn === column) {
      return (
        <ArrowUpDown
          className={`ml-1 h-4 w-4 transform ${
            sortDirection === "desc" ? "rotate-180" : ""
          }`}
        />
      );
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />;
  };

  return (
    <TableHeader>
      <TableRow>
        {!isMobile && (
          <TableHead className="w-[100px]">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center p-0 h-auto font-semibold"
              onClick={() => onSortChange("created_at")}
            >
              Data Cadastro
              {renderSortIndicator("created_at")}
            </Button>
          </TableHead>
        )}
        <TableHead>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center p-0 h-auto font-semibold"
            onClick={() => onSortChange("nome")}
          >
            Nome
            {renderSortIndicator("nome")}
          </Button>
        </TableHead>
        <TableHead className={isMobile ? "w-[60px]" : "w-[100px]"}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center p-0 h-auto font-semibold"
            onClick={() => onSortChange("dia_vencimento")}
          >
            <div className="flex flex-col items-start">
              <span>Dia de</span>
              <span>Venc.</span>
            </div>
            {renderSortIndicator("dia_vencimento")}
          </Button>
        </TableHead>
        <TableHead className={isMobile ? "w-[80px]" : "w-[100px]"}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center p-0 h-auto font-semibold"
            onClick={() => onSortChange("valor_plano")}
          >
            Plano
            {renderSortIndicator("valor_plano")}
          </Button>
        </TableHead>
        <TableHead className={isMobile ? "w-[80px]" : "w-[120px]"}>Status</TableHead>
        <TableHead className={isMobile ? "w-[60px]" : "w-[100px]"}></TableHead>
      </TableRow>
    </TableHeader>
  );
};
