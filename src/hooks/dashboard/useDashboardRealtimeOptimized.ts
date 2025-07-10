import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardRealtimeOptions {
  onCriticalUpdate: () => void;
  onChartUpdate: () => void;
  debounceMs?: number;
}

export const useDashboardRealtimeOptimized = ({
  onCriticalUpdate,
  onChartUpdate,
  debounceMs = 5000 // 5 segundos de debounce
}: DashboardRealtimeOptions) => {
  const criticalUpdateRef = useRef<NodeJS.Timeout>();
  const chartUpdateRef = useRef<NodeJS.Timeout>();

  const debouncedCriticalUpdate = useCallback(() => {
    if (criticalUpdateRef.current) {
      clearTimeout(criticalUpdateRef.current);
    }
    criticalUpdateRef.current = setTimeout(() => {
      onCriticalUpdate();
    }, debounceMs);
  }, [onCriticalUpdate, debounceMs]);

  const debouncedChartUpdate = useCallback(() => {
    if (chartUpdateRef.current) {
      clearTimeout(chartUpdateRef.current);
    }
    chartUpdateRef.current = setTimeout(() => {
      onChartUpdate();
    }, debounceMs);
  }, [onChartUpdate, debounceMs]);

  useEffect(() => {
    // Subscription para mudanças críticas (pagamentos)
    const criticalChannel = supabase
      .channel('dashboard-critical-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        () => {
          debouncedCriticalUpdate();
        }
      )
      .subscribe();

    // Subscription para mudanças nos gráficos (clientes)
    const chartChannel = supabase
      .channel('dashboard-chart-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clientes',
        }, 
        () => {
          debouncedChartUpdate();
        }
      )
      .subscribe();

    return () => {
      if (criticalUpdateRef.current) {
        clearTimeout(criticalUpdateRef.current);
      }
      if (chartUpdateRef.current) {
        clearTimeout(chartUpdateRef.current);
      }
      supabase.removeChannel(criticalChannel);
      supabase.removeChannel(chartChannel);
    };
  }, [debouncedCriticalUpdate, debouncedChartUpdate]);
};