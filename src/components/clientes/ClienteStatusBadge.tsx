
import { Badge } from "@/components/ui/badge";

interface ClienteStatusBadgeProps {
  status: string;
}

export const ClienteStatusBadge = ({ status }: ClienteStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={status === "ativo" ? "status-active" : "status-inactive"}
    >
      {status === "ativo" ? "Ativo" : "Inativo"}
    </Badge>
  );
};
