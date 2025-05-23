
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TablePagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: TablePaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 space-y-3 sm:space-y-0">
      <div className="text-sm text-muted-foreground">
        Mostrando {showingStart} a {showingEnd} de {totalItems} registros
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm whitespace-nowrap">Por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primeira página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          
          <div className="text-sm mx-2">
            Página <span className="font-medium">{currentPage}</span> de{" "}
            <span className="font-medium">{totalPages || 1}</span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
