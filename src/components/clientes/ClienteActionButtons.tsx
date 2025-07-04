
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, MessageCircle } from "lucide-react";
import { Cliente } from "@/types";
import { useNavigate } from "react-router-dom";

interface ClienteActionButtonsProps {
  cliente: Cliente;
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  onSendWhatsApp: (cliente: Cliente) => void;
}

export const ClienteActionButtons = ({ 
  cliente, 
  onVerDetalhes, 
  onConfirmarExclusao,
  onSendWhatsApp
}: ClienteActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-2 pt-2">
      <Button
        onClick={() => onVerDetalhes(cliente)}
        size="sm"
        variant="outline"
        className="flex-1 min-w-0"
      >
        <Eye className="w-4 h-4" />
      </Button>

      <Button
        onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
        size="sm"
        variant="outline"
        className="flex-1 min-w-0"
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Button
        onClick={() => onSendWhatsApp(cliente)}
        size="sm"
        variant="outline"
        className="flex-1 min-w-0"
        title="Enviar WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>

      <Button
        onClick={() => onConfirmarExclusao(cliente.id)}
        size="sm"
        variant="destructive"
        className="flex-1 min-w-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
