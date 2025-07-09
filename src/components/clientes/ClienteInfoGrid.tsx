
import React from "react";
import { Cliente, Pagamento } from "@/types";
import { DueDateInfo } from "./DueDateInfo";
import { 
  Phone, 
  MapPin, 
  Server, 
  DollarSign, 
  Smartphone, 
  PlayCircle,
  User,
  Lock
} from "lucide-react";

interface ClienteInfoGridProps {
  cliente: Cliente;
  allPayments?: Pagamento[];
}

export const ClienteInfoGrid = ({ cliente, allPayments = [] }: ClienteInfoGridProps) => {
  const valorPlanoFormatado = cliente.valor_plano 
    ? `R$ ${cliente.valor_plano.toFixed(2).replace('.', ',')}`
    : "Não informado";

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {cliente.telefone && (
        <div className="flex items-center gap-1">
          <Phone className="w-3 h-3" />
          <span className="truncate">{cliente.telefone}</span>
        </div>
      )}
      
      {cliente.uf && (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{cliente.uf}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        <Server className="w-3 h-3" />
        <span className="truncate">{cliente.servidor}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <DollarSign className="w-3 h-3" />
        <span>{valorPlanoFormatado}</span>
      </div>
      
      {cliente.dispositivo_smart && (
        <div className="flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          <span className="truncate">{cliente.dispositivo_smart}</span>
        </div>
      )}
      
      <div className="flex items-center gap-1">
        <PlayCircle className="w-3 h-3" />
        <span className="truncate">{cliente.aplicativo}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <User className="w-3 h-3" />
        <span className="truncate">{cliente.usuario_aplicativo}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Lock className="w-3 h-3" />
        <span className="truncate">••••••••</span>
      </div>

      {/* Informação de vencimento sempre presente */}
      <div className="col-span-2">
        <DueDateInfo cliente={cliente} allPayments={allPayments} />
      </div>
    </div>
  );
};
