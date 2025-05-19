
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { verificarLicencasCliente } from "@/services/clienteService/clienteLicencaService";
import { LicencaStatus } from "@/types";

interface ClienteLicencaStatusProps {
  clienteId: string;
}

const formatDias = (dias: number | null): string => {
  if (dias === null) return "N/A";
  if (dias < 0) return `Vencido há ${Math.abs(dias)} dias`;
  return `${dias} dias restantes`;
};

const LicencaBadge = ({ status }: { status: LicencaStatus }) => {
  if (status.status === 'n/a') {
    return <Badge variant="outline" className="text-gray-500 bg-gray-100">Sem licença</Badge>;
  }
  
  if (status.status === 'vencida') {
    return (
      <Badge variant="outline" className="text-red-500 bg-red-50 border-red-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Vencida
      </Badge>
    );
  }
  
  if (status.status === 'atenção') {
    return (
      <Badge variant="outline" className="text-amber-500 bg-amber-50 border-amber-200">
        <Clock className="w-3 h-3 mr-1" />
        Atenção
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-green-500 bg-green-50 border-green-200">
      <CheckCircle2 className="w-3 h-3 mr-1" />
      Válida
    </Badge>
  );
};

export const ClienteLicencaStatus: React.FC<ClienteLicencaStatusProps> = ({ clienteId }) => {
  const [licencas, setLicencas] = useState<{
    licencaPrincipal?: LicencaStatus;
    licencaAdicional?: LicencaStatus;
    possuiLicencaVencida: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLicencas = async () => {
      try {
        setLoading(true);
        const result = await verificarLicencasCliente(clienteId);
        if (result.success) {
          setLicencas({
            licencaPrincipal: result.licencaPrincipal,
            licencaAdicional: result.licencaAdicional,
            possuiLicencaVencida: result.possuiLicencaVencida
          });
        }
      } catch (error) {
        console.error("Erro ao verificar licenças:", error);
      } finally {
        setLoading(false);
      }
    };

    if (clienteId) {
      checkLicencas();
    }
  }, [clienteId]);

  if (loading) {
    return <span className="text-sm text-gray-500">Verificando licenças...</span>;
  }

  if (!licencas || !licencas.licencaPrincipal) {
    return <span className="text-sm text-gray-500">Sem informações de licença</span>;
  }

  return (
    <div className="flex flex-col space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <span className="text-sm mr-2">Licença principal:</span>
              <LicencaBadge status={licencas.licencaPrincipal} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {formatDias(licencas.licencaPrincipal.diasRestantes)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {licencas.licencaAdicional && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <span className="text-sm mr-2">Licença adicional:</span>
                <LicencaBadge status={licencas.licencaAdicional} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {formatDias(licencas.licencaAdicional.diasRestantes)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
