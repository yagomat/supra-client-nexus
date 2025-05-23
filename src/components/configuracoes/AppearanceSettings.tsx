
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AppearanceSettings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="font-medium">Modo escuro</p>
          <p className="text-sm text-muted-foreground">
            Ative o modo escuro para uma experiência visual mais confortável em ambientes com pouca luz.
          </p>
        </div>
        <ThemeToggle variant="switch" />
      </div>
    </div>
  );
}
