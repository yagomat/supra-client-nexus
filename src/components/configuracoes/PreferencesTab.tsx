
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppearanceSettings } from "./AppearanceSettings";

export function PreferencesTab() {
  return (
    <Card className="card-enhanced animate-scale-in">
      <CardHeader className="bg-gradient-subtle rounded-t-lg">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          Aparência & Personalização
        </CardTitle>
        <CardDescription className="text-base">
          Personalize a aparência da interface e configure suas preferências visuais.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <AppearanceSettings />
      </CardContent>
    </Card>
  );
}
