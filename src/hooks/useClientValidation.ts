import { useState, useCallback } from "react";
import { Cliente } from "@/types";

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export const useClientValidation = () => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateBasicFields = useCallback((data: Partial<Cliente>): ValidationResult => {
    const newErrors: ValidationError[] = [];
    const newWarnings: string[] = [];

    // Validações básicas obrigatórias (frontend apenas para UX)
    if (!data.nome?.trim()) {
      newErrors.push({ field: 'nome', message: 'Nome é obrigatório' });
    } else if (data.nome.length > 40) {
      newErrors.push({ field: 'nome', message: 'Nome deve ter no máximo 40 caracteres' });
    }

    if (!data.servidor?.trim()) {
      newErrors.push({ field: 'servidor', message: 'Servidor é obrigatório' });
    } else if (data.servidor.length > 25) {
      newErrors.push({ field: 'servidor', message: 'Servidor deve ter no máximo 25 caracteres' });
    }

    if (!data.dia_vencimento) {
      newErrors.push({ field: 'dia_vencimento', message: 'Dia de vencimento é obrigatório' });
    } else if (data.dia_vencimento < 1 || data.dia_vencimento > 31) {
      newErrors.push({ field: 'dia_vencimento', message: 'Dia de vencimento deve ser entre 1 e 31' });
    }

    if (!data.aplicativo?.trim()) {
      newErrors.push({ field: 'aplicativo', message: 'Aplicativo é obrigatório' });
    } else if (data.aplicativo.length > 25) {
      newErrors.push({ field: 'aplicativo', message: 'Aplicativo deve ter no máximo 25 caracteres' });
    }

    // Campos usuario_aplicativo e senha_aplicativo não são mais obrigatórios

    // Validações de formato (warnings para melhor UX)
    if (data.telefone && data.telefone.trim()) {
      const phoneNumbers = data.telefone.replace(/\D/g, '');
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        newWarnings.push('Telefone pode estar em formato incorreto (deve ter 10 ou 11 dígitos)');
      }
    }

    if (data.uf && data.uf.length > 2) {
      newErrors.push({ field: 'uf', message: 'UF deve ter no máximo 2 caracteres' });
    }

    if (data.valor_plano && data.valor_plano <= 0) {
      newErrors.push({ field: 'valor_plano', message: 'Valor do plano deve ser maior que zero' });
    }

    return {
      isValid: newErrors.length === 0,
      errors: newErrors,
      warnings: newWarnings
    };
  }, []);

  const validateProgressive = useCallback((field: keyof Cliente, value: any): ValidationError | null => {
    switch (field) {
      case 'nome':
        if (!value?.trim()) return { field, message: 'Nome é obrigatório' };
        if (value.length > 40) return { field, message: 'Nome deve ter no máximo 40 caracteres' };
        break;
      
      case 'servidor':
        if (!value?.trim()) return { field, message: 'Servidor é obrigatório' };
        if (value.length > 25) return { field, message: 'Servidor deve ter no máximo 25 caracteres' };
        break;
      
      case 'dia_vencimento':
        if (!value) return { field, message: 'Dia de vencimento é obrigatório' };
        if (value < 1 || value > 31) return { field, message: 'Dia deve ser entre 1 e 31' };
        break;
      
      case 'telefone':
        if (value && value.trim()) {
          const phoneNumbers = value.replace(/\D/g, '');
          if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
            return { field, message: 'Telefone deve ter 10 ou 11 dígitos' };
          }
        }
        break;
      
      case 'aplicativo':
        if (!value?.trim()) return { field, message: 'Aplicativo é obrigatório' };
        if (value.length > 25) return { field, message: 'Aplicativo deve ter no máximo 25 caracteres' };
        break;
      
      // Campos usuario_aplicativo e senha_aplicativo não são mais obrigatórios
      
      case 'valor_plano':
        if (value && value <= 0) return { field, message: 'Valor deve ser maior que zero' };
        break;
      
      case 'uf':
        if (value && value.length > 2) return { field, message: 'UF deve ter no máximo 2 caracteres' };
        break;
    }
    
    return null;
  }, []);

  const clearValidation = useCallback(() => {
    setErrors([]);
    setWarnings([]);
    setIsValidating(false);
  }, []);

  const validateAndSet = useCallback((data: Partial<Cliente>) => {
    setIsValidating(true);
    const result = validateBasicFields(data);
    setErrors(result.errors);
    setWarnings(result.warnings);
    setIsValidating(false);
    return result;
  }, [validateBasicFields]);

  return {
    errors,
    warnings,
    isValidating,
    validateBasicFields,
    validateProgressive,
    validateAndSet,
    clearValidation,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0
  };
};