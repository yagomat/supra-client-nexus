
import React from "react";
import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements = [
    {
      text: "Pelo menos 8 caracteres",
      met: password.length >= 8,
      required: true
    },
    {
      text: "Pelo menos uma letra",
      met: /[a-zA-Z]/.test(password),
      required: true
    },
    {
      text: "Pelo menos um número",
      met: /[0-9]/.test(password),
      required: true
    },
    {
      text: "Pelo menos uma letra maiúscula (recomendado)",
      met: /[A-Z]/.test(password),
      required: false
    },
    {
      text: "Pelo menos um símbolo (recomendado)",
      met: /[^A-Za-z0-9]/.test(password),
      required: false
    }
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <p className="text-sm font-medium text-gray-700">Requisitos da senha:</p>
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          {req.met ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className={`h-4 w-4 ${req.required ? 'text-red-500' : 'text-gray-400'}`} />
          )}
          <span className={`${
            req.met 
              ? 'text-green-700' 
              : req.required 
                ? 'text-red-600' 
                : 'text-gray-500'
          }`}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
};
