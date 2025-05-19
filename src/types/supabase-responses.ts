
export interface ValorPredefinidoResponse {
  success: boolean;
  message: string;
  tipo?: string;
  valor?: string | number;
}

export interface ImportValoresPredefinidosResponse {
  success: boolean;
  message: string;
  importados?: number;
  duplicados?: number;
  invalidos?: number;
  valores_invalidos?: string[];
}
