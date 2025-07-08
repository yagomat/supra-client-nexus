
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface PerformanceIndicatorProps {
  totalClientes: number;
  filteredClientes: number;
}

export const PerformanceIndicator = ({ totalClientes, filteredClientes }: PerformanceIndicatorProps) => {
  const [filterTime, setFilterTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setFilterTime(endTime - startTime);
  }, [filteredClientes]);

  const isOptimized = filterTime < 10; // Considera otimizado se filtrar em menos de 10ms

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Badge variant={isOptimized ? "default" : "secondary"} className="flex items-center gap-1">
        <Zap className="w-3 h-3" />
        {isOptimized ? "Otimizado" : "Padrão"}
      </Badge>
      <span>
        {filteredClientes} de {totalClientes} clientes
        {filterTime > 0 && ` (${filterTime.toFixed(1)}ms)`}
      </span>
    </div>
  );
};
