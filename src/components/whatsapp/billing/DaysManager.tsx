
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface DaysManagerProps {
  label: string;
  days: number[];
  onAddDay: (day: number) => void;
  onRemoveDay: (day: number) => void;
  placeholder: string;
}

export const DaysManager = ({ label, days, onAddDay, onRemoveDay, placeholder }: DaysManagerProps) => {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2 mb-2">
        {days.map(day => (
          <Badge key={day} variant="secondary" className="flex items-center gap-1">
            {day} dia{day > 1 ? 's' : ''}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => onRemoveDay(day)}
            />
          </Badge>
        ))}
      </div>
      <Select onValueChange={(value) => onAddDay(parseInt(value))}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 5, 7, 10, 15].map(day => (
            <SelectItem 
              key={day} 
              value={day.toString()}
              disabled={days.includes(day)}
            >
              {day} dia{day > 1 ? 's' : ''} {label.includes('ANTES') ? 'antes' : 'depois'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
