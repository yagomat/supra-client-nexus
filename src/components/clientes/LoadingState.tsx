
import { Loader2 } from "lucide-react";

export const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
      <span className="text-lg">Carregando...</span>
    </div>
  );
};
