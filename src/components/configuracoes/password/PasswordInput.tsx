
import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  maxLength?: number;
  required?: boolean;
}

export function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  error = false,
  maxLength = 50,
  required = false
}: PasswordInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div>
        <Input
          id={id}
          type="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          maxLength={maxLength}
          className={error ? "border-destructive" : ""}
        />
        <div className="text-xs text-gray-500 text-right mt-0.5">
          {value.length}/{maxLength}
        </div>
      </div>
    </div>
  );
}
