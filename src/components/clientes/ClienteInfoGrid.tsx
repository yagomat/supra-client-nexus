
import React from "react";
import { Phone, DollarSign, Server } from "lucide-react";
import { Cliente } from "@/types";
import { formatPhoneNumber } from "./table/PhoneFormatter";
import { DueDateInfo } from "./DueDateInfo";

interface ClienteInfoGridProps {
  cliente: Cliente;
}

export const ClienteInfoGrid = ({ cliente }: ClienteInfoGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
      <div className="flex items-center gap-1">
        <Phone className="w-3 h-3" />
        <span className="truncate">{formatPhoneNumber(cliente.telefone) || "N/A"}</span>
      </div>
      <DueDateInfo cliente={cliente} />
      <div className="flex items-center gap-1">
        <DollarSign className="w-3 h-3" />
        <span>R$ {cliente.valor_plano?.toFixed(2).replace('.', ',') || "0,00"}</span>
      </div>
      <div className="flex items-center gap-1 md:col-span-3">
        <Server className="w-3 h-3" />
        <span className="truncate">{cliente.servidor}</span>
      </div>
    </div>
  );
};
