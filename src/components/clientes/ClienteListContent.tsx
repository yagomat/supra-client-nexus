
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClienteExcelButtons } from "@/components/clientes/ClienteExcelButtons";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteOrderSelector } from "@/components/clientes/ClienteOrderSelector";
import { ClienteViewToggle } from "@/components/clientes/ClienteViewToggle";
import { ClienteListHeader } from "@/components/clientes/ClienteListHeader";
import { ItemsPerPageSelector } from "@/components/table/ItemsPerPageSelector";
import { TablePagination } from "@/components/table/TablePagination";

interface ClienteListContentProps {
  clientes: Cliente[];
  allClientes: Cliente[];
  loading: boolean;
  error: string | null;
  totalClientes: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onImportSuccess: () => void;
  onOrderChange: (order: string) => void;
  order: string;
  isFiltered: boolean;
  isMobile?: boolean;
}

export const ClienteListContent = ({
  clientes,
  allClientes,
  loading,
  error,
  totalClientes,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onImportSuccess,
  onOrderChange,
  order,
  isFiltered,
  isMobile = false
}: ClienteListContentProps) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">('todos');
  const [searchFilter, setSearchFilter] = useState<string>('');

  return (
    <div className="section-spacing">
      <div className="grid grid-cols-1 sm:grid-cols-3 element-spacing">
        <ClienteExcelButtons 
          clientes={allClientes} 
          onImportSuccess={onImportSuccess} 
        />
        <div className="flex justify-center sm:justify-end">
          <Button 
            onClick={() => navigate('/clientes/cadastrar')}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <ClienteFilters
        statusFilter={statusFilter}
        searchFilter={searchFilter}
        onStatusFilterChange={setStatusFilter}
        onSearchFilterChange={setSearchFilter}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center element-spacing">
        <div>
          <p className="text-sm text-muted-foreground">
            {isFiltered 
              ? `Mostrando ${totalClientes} cliente${totalClientes !== 1 ? 's' : ''} (filtrado)`
              : `Total de ${totalClientes} cliente${totalClientes !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center tight-spacing mt-4 sm:mt-0">
          <ClienteOrderSelector 
            order={order}
            onOrderChange={onOrderChange}
          />
          <ClienteViewToggle 
            viewMode="list"
            onViewModeChange={() => {}}
          />
        </div>
      </div>

      <ClienteListHeader 
        clientes={clientes} 
        loading={loading} 
        error={error || ""} 
      />
      
      <div className="component-spacing">
        <ItemsPerPageSelector
          value={itemsPerPage}
          onChange={onItemsPerPageChange}
        />
        
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </div>
    </div>
  );
};
