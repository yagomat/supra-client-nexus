
import { checkClienteLicencas } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";

export interface LicencaStatus {
  status: 'válida' | 'atenção' | 'vencida' | 'n/a';
  diasRestantes: number | null;
  vencida: boolean;
}

export interface ClienteLicencasResult {
  success: boolean;
  message?: string;
  licencaPrincipal?: LicencaStatus;
  licencaAdicional?: LicencaStatus;
  possuiLicencaVencida: boolean;
}

export async function verificarLicencasCliente(clienteId: string): Promise<ClienteLicencasResult> {
  try {
    const result = await checkClienteLicencas(clienteId);
    return result as unknown as ClienteLicencasResult;
  } catch (error) {
    console.error("Erro ao verificar licenças:", error);
    return {
      success: false,
      message: "Erro ao verificar licenças do cliente",
      possuiLicencaVencida: false
    };
  }
}
