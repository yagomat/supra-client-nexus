
import { ValuesTable } from "./ValuesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValoresPredefinidos } from "@/types";

interface TabsContainerProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  valoresPredefinidos: ValoresPredefinidos;
  onDeleteValue: (type: string, value: string | number) => void;
}

export const TabsContainer = ({ activeTab, onTabChange, valoresPredefinidos, onDeleteValue }: TabsContainerProps) => {
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
      <TabsList className="grid grid-cols-3 md:grid-cols-6">
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
    </Tabs>
  );
};
