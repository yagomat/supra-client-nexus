
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConfigTabNavigationProps {
  isMobile: boolean;
}

export const ConfigTabNavigation = ({ isMobile }: ConfigTabNavigationProps) => {
  const baseTabClasses = "text-xs py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]";

  if (isMobile) {
    return (
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-1">
        <TabsList className="grid grid-cols-3 gap-2 h-auto p-0 bg-transparent w-full">
          <TabsTrigger 
            value="profile" 
            className={`${baseTabClasses} px-2`}
          >
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className={`${baseTabClasses} px-2`}
          >
            Preferências
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className={`${baseTabClasses} px-2`}
          >
            Logs
          </TabsTrigger>
        </TabsList>
      </div>
    );
  }

  return (
    <TabsList className="grid grid-cols-3 gap-4 h-auto p-0 bg-transparent w-full max-w-2xl mx-auto">
      <TabsTrigger 
        value="profile" 
        className={`${baseTabClasses} px-6 py-3`}
      >
        Perfil
      </TabsTrigger>
      <TabsTrigger 
        value="preferences" 
        className={`${baseTabClasses} px-6 py-3`}
      >
        Preferências
      </TabsTrigger>
      <TabsTrigger 
        value="security" 
        className={`${baseTabClasses} px-6 py-3`}
      >
        Auditoria de Segurança
      </TabsTrigger>
    </TabsList>
  );
};
