
import React from "react";
import { Phone, Calendar, Server } from "lucide-react";
import { Cliente } from "@/types";
import { formatPhoneNumber } from "./table/PhoneFormatter";
import { DueDateInfo } from "./DueDateInfo";

interface ClienteInfoGridProps {
  cliente: Cliente;
}

export const ClienteInfoGrid = ({ cliente }: ClienteInfoGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{formatPhoneNumber(cliente.telefone) || "N/A"}</span>
      </div>
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <span>Dia {cliente.dia_vencimento}</span>
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <Server className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{cliente.servidor}</span>
      </div>
      <div className="flex items-center gap-2 md:col-span-2">
        <DueDateInfo cliente={cliente} />
      </div>
    </div>
  );
};
