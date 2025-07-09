
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-card rounded-lg border border-border/50 transition-all duration-300 hover:shadow-soft">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs text-primary">🌓</span>
              </div>
              <p className="font-semibold text-foreground">Modo Escuro</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Ative o modo escuro para uma experiência visual mais confortável em ambientes com pouca luz.
            </p>
          </div>
          <ThemeToggle variant="switch" />
        </div>
      </div>
    </div>
  );
}
