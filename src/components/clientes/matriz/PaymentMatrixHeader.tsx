
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MesData {
  value: number;
  label: string;
}

interface PaymentMatrixHeaderProps {
  meses: MesData[];
  isMobile?: boolean;
}

export const PaymentMatrixHeader = ({ meses, isMobile = false }: PaymentMatrixHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead className="font-medium sticky left-0 bg-muted/50 z-30 border-r-2 border-border shadow-xl">Nome</TableHead>
        <TableHead>
          <div className="leading-tight font-medium">
            <div>Dia de</div>
            <div>Venc.</div>
          </div>
        </TableHead>
        <TableHead className="font-medium">Status</TableHead>
        {meses.map((mes) => (
          <TableHead key={mes.value} className="text-center font-medium">
            {isMobile ? mes.label.substring(0, 3) : mes.label.substring(0, 3)}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
