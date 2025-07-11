
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppearanceSettings } from "./AppearanceSettings";
import { DefaultFiltersSettings } from "./DefaultFiltersSettings";

export function PreferencesTab() {
  return (
    <div className="space-y-6">
      <Card className="card-enhanced animate-scale-in">
        <CardHeader className="bg-gradient-subtle rounded-t-lg">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
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

      <DefaultFiltersSettings />
    </div>
  );
}
