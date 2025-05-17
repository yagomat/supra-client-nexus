
import { Badge } from "@/components/ui/badge";

interface ClientStatusBadgeProps {
  status: string;
}

export const ClientStatusBadge = ({ status }: ClientStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={`px-2 py-1 ${
        status === "ativo" ? 
        "border-green-500 text-green-500 bg-green-50" : 
        "border-red-500 text-red-500 bg-red-50"
      }`}
    >
      {status === "ativo" ? "Ativo" : "Inativo"}
    </Badge>
  );
};
