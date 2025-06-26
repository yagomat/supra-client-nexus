
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const codigosPais = [
  { codigo: "+55", pais: "Brasil", bandeira: "🇧🇷" },
  { codigo: "+1", pais: "EUA/Canadá", bandeira: "🇺🇸" },
  { codigo: "+44", pais: "Reino Unido", bandeira: "🇬🇧" },
  { codigo: "+33", pais: "França", bandeira: "🇫🇷" },
  { codigo: "+49", pais: "Alemanha", bandeira: "🇩🇪" },
  { codigo: "+34", pais: "Espanha", bandeira: "🇪🇸" },
  { codigo: "+39", pais: "Itália", bandeira: "🇮🇹" },
  { codigo: "+351", pais: "Portugal", bandeira: "🇵🇹" },
  { codigo: "+54", pais: "Argentina", bandeira: "🇦🇷" },
  { codigo: "+56", pais: "Chile", bandeira: "🇨🇱" },
  { codigo: "+57", pais: "Colômbia", bandeira: "🇨🇴" },
  { codigo: "+52", pais: "México", bandeira: "🇲🇽" },
];

interface CodigoPaisSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export const CodigoPaisSelect = ({ value, onValueChange, disabled }: CodigoPaisSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Código" />
      </SelectTrigger>
      <SelectContent>
        {codigosPais.map((pais) => (
          <SelectItem key={pais.codigo} value={pais.codigo}>
            <div className="flex items-center gap-2">
              <span>{pais.bandeira}</span>
              <span>{pais.codigo}</span>
              <span className="text-muted-foreground text-xs">{pais.pais}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
