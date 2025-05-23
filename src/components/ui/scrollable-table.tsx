
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
              .fixed-column-1 {
                position: sticky;
                left: 0;
                z-index: 10;
                background-color: var(--background);
                box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
                /* Garantir que o fundo cubra completamente */
                isolation: isolate;
              }
              .fixed-column-2 {
                position: sticky;
                left: var(--left-offset, 130px);
                z-index: 10;
                background-color: var(--background);
                box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
                /* Garantir que o fundo cubra completamente */
                isolation: isolate;
              }
              /* Deixando o fundo mais escuro nas colunas fixas no tema escuro */
              .table-dark .fixed-column-1,
              .table-dark .fixed-column-2 {
                background-color: hsl(222.2, 84%, 4.9%);
              }
              
              /* Adicionar cores para os estados de hover para as colunas fixas para prevenir transparência */
              tr:hover .fixed-column-1,
              tr:hover .fixed-column-2 {
                background-color: var(--muted);
              }
              
              .table-dark tr:hover .fixed-column-1,
              .table-dark tr:hover .fixed-column-2 {
                background-color: hsl(222.2, 84%, 6%);
              }
            `}} />
          )}
          {children}
        </Table>
      </div>
    </div>
  );
};
