import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  ClientePaginatedService, 
  PaginationParams, 
  PaginatedResponse 
} from "@/services/clientePaginatedService";
import { Cliente } from "@/types";

interface UsePaginatedClientesOptions {
  initialPage?: number;
  initialLimit?: number;
  autoFetch?: boolean;
}

export const usePaginatedClientes = (options: UsePaginatedClientesOptions = {}) => {
  const { 
    initialPage = 1, 
    initialLimit = 50, 
    autoFetch = true 
  } = options;
  
  const { toast } = useToast();
  
  // Estados principais
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialLimit);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Função principal para buscar clientes
  const fetchClientes = useCallback(async (params?: Partial<PaginationParams>) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams: PaginationParams = {
        page: params?.page ?? currentPage,
        limit: params?.limit ?? pageSize,
        search: params?.search ?? (debouncedSearch || undefined),
        status: params?.status ?? statusFilter,
        includeSensitive: params?.includeSensitive ?? false
      };
      
      const response: PaginatedResponse = await ClientePaginatedService.getPaginatedClientes(searchParams);
      
      setClientes(response.data);
      setCurrentPage(response.pagination.page);
      setPageSize(response.pagination.limit);
      setTotalRecords(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
      setHasNext(response.pagination.has_next);
      setHasPrev(response.pagination.has_prev);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao carregar clientes";
      setError(errorMessage);
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, toast]);
  
  // Carregar dados automaticamente
  useEffect(() => {
    if (autoFetch) {
      fetchClientes();
    }
  }, [debouncedSearch, statusFilter]); // Remover fetchClientes das deps para evitar loop
  
  // Funções de navegação
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchClientes({ page });
    }
  }, [currentPage, totalPages, fetchClientes]);
  
  const goToNextPage = useCallback(() => {
    if (hasNext) {
      goToPage(currentPage + 1);
    }
  }, [hasNext, currentPage, goToPage]);
  
  const goToPrevPage = useCallback(() => {
    if (hasPrev) {
      goToPage(currentPage - 1);
    }
  }, [hasPrev, currentPage, goToPage]);
  
  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  const goToLastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);
  
  // Funções de filtro
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset para primeira página ao buscar
  }, []);
  
  const handleStatusFilter = useCallback((status: "todos" | "ativo" | "inativo") => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }, []);
  
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset para primeira página ao mudar tamanho
    fetchClientes({ limit: newSize, page: 1 });
  }, [fetchClientes]);
  
  // Limpar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("todos");
    setCurrentPage(1);
  }, []);
  
  // Refresh dos dados
  const refresh = useCallback(() => {
    ClientePaginatedService.clearAllClientesCache();
    fetchClientes();
  }, [fetchClientes]);
  
  // Informações de paginação calculadas
  const paginationInfo = useMemo(() => {
    const start = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, totalRecords);
    
    return {
      showing: `${start}-${end}`,
      total: totalRecords,
      pages: totalPages,
      currentPage,
      pageSize,
      hasNext,
      hasPrev
    };
  }, [currentPage, pageSize, totalRecords, totalPages, hasNext, hasPrev]);
  
  return {
    // Dados
    clientes,
    loading,
    error,
    
    // Paginação
    paginationInfo,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    handlePageSizeChange,
    
    // Filtros
    searchTerm,
    statusFilter,
    handleSearch,
    handleStatusFilter,
    clearFilters,
    
    // Controles
    fetchClientes,
    refresh
  };
};