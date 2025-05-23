
import { Badge } from "@/components/ui/badge";

interface ClienteStatusBadgeProps {
  status: string;
}

export const ClienteStatusBadge = ({ status }: ClienteStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={`px-2 py-0.5 text-xs ${
        status === "ativo" ? 
        "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-600" : 
        "border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-600"
      }`}
    >
      {status === "ativo" ? "Ativo" : "Inativo"}
    </Badge>
  );
};
