
import { Badge } from "@/components/ui/badge";

interface ClientStatusBadgeProps {
  status: string;
}

export const ClientStatusBadge = ({ status }: ClientStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={status === "ativo" ? "status-active" : "status-inactive"}
    >
      {status === "ativo" ? "Ativo" : "Inativo"}
    </Badge>
  );
};
