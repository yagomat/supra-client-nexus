
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-subtle rounded-lg border border-border/50">
          <h4 className="font-semibold text-foreground mb-2">Modo Claro</h4>
          <div className="w-full h-20 bg-white rounded border-2 border-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-sm">Visualização Clara</span>
          </div>
        </div>
        
        <div className="p-4 bg-gradient-subtle rounded-lg border border-border/50">
          <h4 className="font-semibold text-foreground mb-2">Modo Escuro</h4>
          <div className="w-full h-20 bg-gray-900 rounded border-2 border-gray-700 flex items-center justify-center">
            <span className="text-gray-300 text-sm">Visualização Escura</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gradient-card rounded-lg border border-border/50">
        <h4 className="font-semibold text-foreground mb-3">Dicas de Acessibilidade</h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>O modo escuro reduz a fadiga ocular em ambientes com pouca luz</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>O modo claro oferece melhor contraste para leitura durante o dia</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>A configuração é sincronizada automaticamente em todos os dispositivos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
