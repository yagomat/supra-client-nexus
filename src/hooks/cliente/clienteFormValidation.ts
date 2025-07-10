import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { ClienteFormValues } from "./clienteFormSchema";
import { convertFormToCliente } from "./clienteFormUtils";
import { Cliente } from "@/types";

interface UseRealTimeValidationProps {
  form: UseFormReturn<ClienteFormValues>;
  validateCliente: (data: Partial<Cliente>) => Promise<any>;
  enabled: boolean;
  setLastValidationTime: (time: Date | null) => void;
}

export const useRealTimeValidation = ({
  form,
  validateCliente,
  enabled,
  setLastValidationTime
}: UseRealTimeValidationProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Validação em tempo real (debounced)
  const performRealTimeValidation = async (data: ClienteFormValues) => {
    if (!enabled) return;
    
    try {
      await validateCliente(convertFormToCliente(data));
      setLastValidationTime(new Date());
    } catch (error) {
      console.error("Erro na validação em tempo real:", error);
    }
  };

  // Debounced validation
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        performRealTimeValidation(data as ClienteFormValues);
      }, 1000); // Debounce de 1 segundo
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, enabled]);

  // Força uma validação manual
  const forceValidation = async () => {
    const data = form.getValues();
    await performRealTimeValidation(data);
  };

  return { forceValidation };
};