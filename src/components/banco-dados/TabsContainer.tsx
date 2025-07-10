
import { ValuesTable } from "./ValuesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValoresPredefinidos } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface TabsContainerProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  valoresPredefinidos: ValoresPredefinidos;
  onDeleteValue: (type: string, value: string | number) => void;
}

export const TabsContainer = ({ activeTab, onTabChange, valoresPredefinidos, onDeleteValue }: TabsContainerProps) => {
  const isMobile = useIsMobile();
  
  const renderValues = (type: keyof ValoresPredefinidos) => {
    const values = valoresPredefinidos[type];
    const isNumeric = ["dias_vencimento"].includes(type);
    const isPlano = type === "valores_plano";
    
    return (
      <ValuesTable 
        values={values}
        type={type}
        onDelete={onDeleteValue}
        isNumeric={isNumeric}
        isPlano={isPlano}
      />
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="pt-1"
    >
      {/* Mobile view: grid layout without scroll */}
      {isMobile ? (
        <div className="space-y-2">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-1">
            <TabsList className="grid grid-cols-2 gap-2 h-auto p-2 bg-transparent">
              <TabsTrigger 
                value="ufs" 
                className="text-xs px-3 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                UF
              </TabsTrigger>
              <TabsTrigger 
                value="servidores" 
                className="text-xs px-3 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Servidores
              </TabsTrigger>
              <TabsTrigger 
                value="dias_vencimento" 
                className="text-xs px-3 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Vencimentos
              </TabsTrigger>
              <TabsTrigger 
                value="valores_plano" 
                className="text-xs px-3 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Plano
              </TabsTrigger>
              <TabsTrigger 
                value="dispositivos_smart" 
                className="text-xs px-3 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Dispositivos
              </TabsTrigger>
              <TabsTrigger 
                value="aplicativos" 
                className="text-xs px-3 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Aplicativos
              </TabsTrigger>
            </TabsList>
          </div>
          {/* Content with minimal spacing for mobile */}
          <div className="pt-1">
            <TabsContent value="ufs" className="mt-0">{renderValues("ufs")}</TabsContent>
            <TabsContent value="servidores" className="mt-0">{renderValues("servidores")}</TabsContent>
            <TabsContent value="dias_vencimento" className="mt-0">{renderValues("dias_vencimento")}</TabsContent>
            <TabsContent value="valores_plano" className="mt-0">{renderValues("valores_plano")}</TabsContent>
            <TabsContent value="dispositivos_smart" className="mt-0">{renderValues("dispositivos_smart")}</TabsContent>
            <TabsContent value="aplicativos" className="mt-0">{renderValues("aplicativos")}</TabsContent>
          </div>
        </div>
      ) : (
        // Desktop view: updated styling
        <>
          <TabsList className="grid grid-cols-6 gap-2 p-2 bg-transparent h-auto">
            <TabsTrigger 
              value="ufs"
              className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              UF
            </TabsTrigger>
            <TabsTrigger 
              value="servidores"
              className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Servidores
            </TabsTrigger>
            <TabsTrigger 
              value="dias_vencimento"
              className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Vencimentos
            </TabsTrigger>
            <TabsTrigger 
              value="valores_plano"
              className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Plano
            </TabsTrigger>
            <TabsTrigger 
              value="dispositivos_smart"
              className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Dispositivos
            </TabsTrigger>
            <TabsTrigger 
              value="aplicativos"
              className="px-4 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Aplicativos
            </TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="ufs">{renderValues("ufs")}</TabsContent>
            <TabsContent value="servidores">{renderValues("servidores")}</TabsContent>
            <TabsContent value="dias_vencimento">{renderValues("dias_vencimento")}</TabsContent>
            <TabsContent value="valores_plano">{renderValues("valores_plano")}</TabsContent>
            <TabsContent value="dispositivos_smart">{renderValues("dispositivos_smart")}</TabsContent>
            <TabsContent value="aplicativos">{renderValues("aplicativos")}</TabsContent>
          </div>
        </>
      )}
    </Tabs>
  );
};
