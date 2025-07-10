import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Plus,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";

interface ValueManagerToolbarProps {
  tipo: string;
  onAdd: (tipo: string) => void;
  onImport: (tipo: string) => void;
  onExport: (tipo: string) => void;
  onDeleteAll: () => void;
  isLoading: boolean;
  hasValues: boolean;
}

export function ValueManagerToolbar({
  tipo,
  onAdd,
  onImport,
  onExport,
  onDeleteAll,
  isLoading,
  hasValues
}: ValueManagerToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center element-spacing mb-4">
      <Button
        onClick={() => onAdd(tipo)}
        disabled={isLoading}
        className="btn-primary w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar {getTipoDisplayName(tipo)}
      </Button>
      
      <div className="flex flex-col sm:flex-row tight-spacing w-full sm:w-auto mt-4 sm:mt-0">
        <Button
          onClick={() => onImport(tipo)}
          disabled={isLoading}
          variant="outline"
          className="btn-outline w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          Importar
        </Button>
        
        <Button
          onClick={() => onExport(tipo)}
          disabled={isLoading || !hasValues}
          variant="outline"
          className="btn-outline w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        
        <Button
          onClick={onDeleteAll}
          disabled={isLoading || !hasValues}
          variant="destructive"
          className="btn-destructive w-full sm:w-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar Tudo
        </Button>
      </div>
    </div>
  );
}

function getTipoDisplayName(tipo: string): string {
  switch (tipo) {
    case "aplicativos":
      return "Aplicativos";
    case "servidores":
      return "Servidores";
    case "ufs":
      return "UFs";
    case "usuarios":
      return "Usuários";
    case "senhas":
      return "Senhas";
    case "dispositivos":
      return "Dispositivos";
    default:
      return "";
  }
}
