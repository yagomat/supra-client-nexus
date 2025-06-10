
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
      className="pt-4"
    >
      {/* Mobile view: grid layout without scroll */}
      {isMobile ? (
        <div className="space-y-6">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-2">
            <TabsList className="grid grid-cols-2 gap-1 h-auto p-1">
              <TabsTrigger value="ufs" className="text-xs px-2 py-2">UF</TabsTrigger>
              <TabsTrigger value="servidores" className="text-xs px-2 py-2">Servidores</TabsTrigger>
              <TabsTrigger value="dias_vencimento" className="text-xs px-2 py-2">Vencimentos</TabsTrigger>
              <TabsTrigger value="valores_plano" className="text-xs px-2 py-2">Plano</TabsTrigger>
              <TabsTrigger value="dispositivos_smart" className="text-xs px-2 py-2">Dispositivos</TabsTrigger>
              <TabsTrigger value="aplicativos" className="text-xs px-2 py-2">Aplicativos</TabsTrigger>
            </TabsList>
          </div>
          {/* Content with proper spacing for mobile */}
          <div className="pt-4">
            <TabsContent value="ufs" className="mt-0">{renderValues("ufs")}</TabsContent>
            <TabsContent value="servidores" className="mt-0">{renderValues("servidores")}</TabsContent>
            <TabsContent value="dias_vencimento" className="mt-0">{renderValues("dias_vencimento")}</TabsContent>
            <TabsContent value="valores_plano" className="mt-0">{renderValues("valores_plano")}</TabsContent>
            <TabsContent value="dispositivos_smart" className="mt-0">{renderValues("dispositivos_smart")}</TabsContent>
            <TabsContent value="aplicativos" className="mt-0">{renderValues("aplicativos")}</TabsContent>
          </div>
        </div>
      ) : (
        // Desktop view: unchanged
        <>
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="ufs">UF</TabsTrigger>
            <TabsTrigger value="servidores">Servidores</TabsTrigger>
            <TabsTrigger value="dias_vencimento">Vencimentos</TabsTrigger>
            <TabsTrigger value="valores_plano">Plano</TabsTrigger>
            <TabsTrigger value="dispositivos_smart">Dispositivos</TabsTrigger>
            <TabsTrigger value="aplicativos">Aplicativos</TabsTrigger>
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
