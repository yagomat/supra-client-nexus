
import React from "react";

interface PasswordStrengthMeterProps {
  passwordStrength: 'fraca' | 'média' | 'forte' | null;
  passwordFeedback: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  passwordStrength, 
  passwordFeedback 
}) => {
  if (!passwordStrength) return null;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div 
        className={`h-2 w-full rounded ${
          passwordStrength === 'fraca' 
            ? 'bg-red-500' 
            : passwordStrength === 'média' 
              ? 'bg-yellow-500' 
              : 'bg-green-500'
        }`}
      />
      <span>{passwordFeedback}</span>
    </div>
  );
};
