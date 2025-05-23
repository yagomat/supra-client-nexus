
import { ReactNode, useRef, useEffect, useState } from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ScrollableTableProps {
  children: ReactNode;
  className?: string;
  fixedColumns?: number;
}

export const ScrollableTable = ({ 
  children, 
  className,
  fixedColumns = 0
}: ScrollableTableProps) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [showTopScroller, setShowTopScroller] = useState(true);
  
  // Atualizar o estado dos scrollbars quando o componente é montado
  useEffect(() => {
    const checkOverflow = () => {
      if (tableRef.current) {
        const isOverflowing = tableRef.current.scrollWidth > tableRef.current.clientWidth;
        setShowTopScroller(isOverflowing);
      }
    };

    checkOverflow();
    
    // Adicionar listener para resize para checar novamente
    window.addEventListener('resize', checkOverflow);
    
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);
  
  return (
    <div className={`w-full rounded-md border overflow-hidden ${className || ''}`}>
      {/* Barra de rolagem superior (visível apenas quando necessário) */}
      {showTopScroller && (
        <div className="h-2.5 border-b border-border/50">
          <ScrollArea className="h-full">
            <div style={{ width: tableRef.current?.scrollWidth || '100%', height: '1px' }} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      
      {/* Conteúdo da tabela com scroll */}
      <div 
        ref={tableRef}
        className={`w-full overflow-auto ${fixedColumns > 0 ? 'relative' : ''}`}
      >
        <Table>
          {fixedColumns > 0 && (
            <style dangerouslySetInnerHTML={{ __html: `
              /* Estilos base para colunas fixas */
              .fixed-column-1,
              .fixed-column-2 {
                position: sticky;
                z-index: 20;
                box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
                isolation: isolate;
                background-color: var(--background);
                backdrop-filter: blur(8px);
              }
              
              /* Posicionamento específico */
              .fixed-column-1 {
                left: 0;
              }
              
              .fixed-column-2 {
                left: var(--left-offset, 130px);
              }
              
              /* Tema escuro - colunas fixas */
              .dark .fixed-column-1,
              .dark .fixed-column-2,
              .table-dark .fixed-column-1,
              .table-dark .fixed-column-2 {
                background-color: hsl(222.2, 84%, 4.9%);
              }
              
              /* Estilos de hover */
              tr:hover .fixed-column-1,
              tr:hover .fixed-column-2 {
                background-color: var(--muted);
              }
              
              /* Tema escuro - hover */
              .dark tr:hover .fixed-column-1,
              .dark tr:hover .fixed-column-2,
              .table-dark tr:hover .fixed-column-1,
              .table-dark tr:hover .fixed-column-2 {
                background-color: hsl(222.2, 84%, 6%);
              }
              
              /* Garantir que as bordas das linhas sejam contínuas */
              tr {
                position: relative;
              }
              
              /* Reforçar a visibilidade da borda superior nas colunas fixas */
              thead .fixed-column-1,
              thead .fixed-column-2 {
                box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
                background-color: var(--background);
              }
              
              /* Tema escuro - cabeçalho */
              .dark thead .fixed-column-1,
              .dark thead .fixed-column-2,
              .table-dark thead .fixed-column-1,
              .table-dark thead .fixed-column-2 {
                background-color: hsl(222.2, 84%, 4.9%);
              }
            `}} />
          )}
          {children}
        </Table>
      </div>
    </div>
  );
};

