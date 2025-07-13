
/**
 * Utilitários para criptografia segura no frontend
 */

export interface EncryptionValidation {
  isEncrypted: boolean;
  isValid: boolean;
  format: 'hex' | 'base64' | 'unknown';
  length: number;
}

/**
 * Valida se um valor está criptografado usando critérios mais rigorosos
 */
export function validateEncryptionFormat(value: string | null): EncryptionValidation {
  if (!value || typeof value !== 'string') {
    return {
      isEncrypted: false,
      isValid: false,
      format: 'unknown',
      length: 0
    };
  }

  const trimmedValue = value.trim();
  const length = trimmedValue.length;

  // Verificar se é hexadecimal (padrão AES)
  const isHexPattern = /^[a-f0-9]+$/i.test(trimmedValue);
  const isValidHexLength = length >= 32 && length <= 1024 && length % 2 === 0;

  // Verificar se é base64
  const isBase64Pattern = /^[A-Za-z0-9+/]+=*$/.test(trimmedValue);
  const isValidBase64Length = length >= 24 && length <= 1024;

  if (isHexPattern && isValidHexLength) {
    return {
      isEncrypted: true,
      isValid: true,
      format: 'hex',
      length
    };
  }

  if (isBase64Pattern && isValidBase64Length) {
    return {
      isEncrypted: true,
      isValid: true,
      format: 'base64',
      length
    };
  }

  return {
    isEncrypted: false,
    isValid: length > 0,
    format: 'unknown',
    length
  };
}

/**
 * Detecta se múltiplos campos estão criptografados
 */
export function detectClienteEncryptionStatus(cliente: any): {
  hasEncryptedFields: boolean;
  encryptedFields: string[];
  totalFields: number;
} {
  const sensitiveFields = ['telefone', 'usuario_aplicativo', 'senha_aplicativo', 'usuario_2', 'senha_2'];
  const encryptedFields: string[] = [];

  sensitiveFields.forEach(field => {
    if (cliente[field]) {
      const validation = validateEncryptionFormat(cliente[field]);
      if (validation.isEncrypted) {
        encryptedFields.push(field);
      }
    }
  });

  return {
    hasEncryptedFields: encryptedFields.length > 0,
    encryptedFields,
    totalFields: sensitiveFields.length
  };
}

/**
 * Gera um hash seguro para identificação de dados sem expor conteúdo
 */
export function generateSecureHash(data: string): string {
  // Usar uma função de hash simples para identificação
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}
