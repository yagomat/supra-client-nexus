
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppearanceSettings } from "./AppearanceSettings";

export function PreferencesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência da interface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AppearanceSettings />
      </CardContent>
    </Card>
  );
}
