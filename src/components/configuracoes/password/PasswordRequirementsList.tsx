
import { Check, X } from "lucide-react";

interface PasswordRequirementsListProps {
  password: string;
}

export function PasswordRequirementsList({ password }: PasswordRequirementsListProps) {
  const requirements = [
    {
      test: /[a-zA-Z]/.test(password),
      text: "Pelo menos uma letra (obrigatório)"
    },
    {
      test: /[0-9]/.test(password),
      text: "Pelo menos um número (obrigatório)"
    },
    {
      test: password.length >= 8,
      text: "Mínimo de 8 caracteres (obrigatório)"
    }
  ];

  return (
    <div className="space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          {req.test ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <X size={16} className="text-red-500" />
          )}
          <span className={req.test ? "text-green-700" : "text-red-600"}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
}
