
import { ReactNode, useRef, useEffect, useState } from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <ScrollArea 
          className="h-2.5 border-b border-border/50"
          orientation="horizontal"
        >
          <div style={{ width: tableRef.current?.scrollWidth || '100%', height: '1px' }} />
        </ScrollArea>
      )}
      
      {/* Conteúdo da tabela com scroll */}
      <div 
        ref={tableRef}
        className={`w-full overflow-auto ${fixedColumns > 0 ? 'relative' : ''}`}
      >
        <Table>
          {fixedColumns > 0 && (
            <style jsx global>{`
              .fixed-column-1 {
                position: sticky;
                left: 0;
                z-index: 10;
                background-color: var(--background);
                box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
              }
              .fixed-column-2 {
                position: sticky;
                left: var(--left-offset, 130px);
                z-index: 10;
                background-color: var(--background);
                box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
              }
              .table-dark .fixed-column-1,
              .table-dark .fixed-column-2 {
                background-color: hsl(222.2, 84%, 4.9%);
              }
            `}</style>
          )}
          {children}
        </Table>
      </div>
    </div>
  );
};
