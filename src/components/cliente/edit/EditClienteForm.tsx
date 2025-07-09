
import React from "react";
import { Control } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ValoresPredefinidos } from "@/types";
import { ClienteFormValues } from "@/hooks/cliente/clienteFormSchema";
import { BasicInformationSection } from "@/components/cliente/form-sections/BasicInformationSection";
import { MainScreenSection } from "@/components/cliente/form-sections/MainScreenSection";
import { AdditionalScreenSection } from "@/components/cliente/form-sections/AdditionalScreenSection";
import { ObservationsSection } from "@/components/cliente/form-sections/ObservationsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditClienteFormProps {
  form: any;
  valoresPredefinidos: ValoresPredefinidos | null;
  possuiTelaAdicional: boolean;
  setPossuiTelaAdicional: (value: boolean) => void;
  onSubmit: (data: ClienteFormValues) => void;
  isSubmitting: boolean;
  children: React.ReactNode;
}

export const EditClienteForm: React.FC<EditClienteFormProps> = ({
  form,
  valoresPredefinidos,
  possuiTelaAdicional,
  setPossuiTelaAdicional,
  onSubmit,
  isSubmitting,
  children,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInformationSection 
          control={form.control} 
          valoresPredefinidos={valoresPredefinidos} 
          disabled={isSubmitting} 
        />

        <MainScreenSection 
          control={form.control} 
          valoresPredefinidos={valoresPredefinidos} 
          disabled={isSubmitting} 
        />

        <div className="flex items-center space-x-3 p-4 bg-gradient-card rounded-lg border border-border/50">
          <Switch
            id="possuiTelaAdicional"
            checked={possuiTelaAdicional}
            onCheckedChange={setPossuiTelaAdicional}
            disabled={isSubmitting}
          />
          <label
            htmlFor="possuiTelaAdicional"
            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Acrescentar uma tela adicional
          </label>
        </div>

        {possuiTelaAdicional && (
          <AdditionalScreenSection 
            control={form.control} 
            valoresPredefinidos={valoresPredefinidos} 
            disabled={isSubmitting} 
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <ObservationsSection control={form.control} disabled={isSubmitting} />
          </CardContent>
        </Card>

        {children}
      </form>
    </Form>
  );
};
