
interface PasswordStrengthIndicatorProps {
  password: string;
  strength: 'fraca' | 'média' | 'forte' | null;
  feedback: string;
}

export function PasswordStrengthIndicator({
  password,
  strength,
  feedback
}: PasswordStrengthIndicatorProps) {
  if (!password || !strength) return null;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div 
        className={`h-2 w-full rounded ${
          strength === 'fraca' 
            ? 'bg-red-500' 
            : strength === 'média' 
              ? 'bg-yellow-500' 
              : 'bg-green-500'
        }`}
      />
      <span>{feedback}</span>
    </div>
  );
}
