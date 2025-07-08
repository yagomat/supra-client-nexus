import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface ValoresPredefinidosAuditLog {
  id: string;
  event_type: string;
  details: Json;
  created_at: string;
  ip_address?: string;
}

export const useValoresPredefinidosAudit = () => {
  const [logs, setLogs] = useState<ValoresPredefinidosAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAuditLogs = async (operation?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select('id, event_type, details, created_at, ip_address')
        .like('event_type', 'valores_predefinidos_%')
        .order('created_at', { ascending: false })
        .limit(100);

      if (operation) {
        query = query.like('event_type', `%${operation}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de auditoria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOperationStats = () => {
    const stats = logs.reduce((acc, log) => {
      const details = log.details as any;
      const operation = details?.operation || 'unknown';
      if (!acc[operation]) {
        acc[operation] = 0;
      }
      acc[operation]++;
      return acc;
    }, {} as Record<string, number>);

    return stats;
  };

  const getRecentActivity = (hours = 24) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return logs.filter(log => 
      new Date(log.created_at) > cutoff
    );
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return {
    logs,
    loading,
    fetchAuditLogs,
    getOperationStats,
    getRecentActivity,
  };
};