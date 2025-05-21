
import React from "react";
import { Check, X } from "lucide-react";

interface PasswordRequirementProps {
  password: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementProps> = ({ password }) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2 text-sm">
        {/[A-Z]/.test(password) ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} className="text-gray-300" />
        )}
        <span>Pelo menos uma letra maiúscula</span>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        {/[a-z]/.test(password) ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} className="text-gray-300" />
        )}
        <span>Pelo menos uma letra minúscula</span>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        {/[0-9]/.test(password) ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} className="text-gray-300" />
        )}
        <span>Pelo menos um número</span>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        {/[^A-Za-z0-9]/.test(password) ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} className="text-gray-300" />
        )}
        <span>Pelo menos um caractere especial</span>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        {password.length >= 8 ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <X size={16} className="text-gray-300" />
        )}
        <span>Mínimo de 8 caracteres</span>
      </div>
    </div>
  );
};
