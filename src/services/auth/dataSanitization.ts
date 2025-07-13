
// DEPRECATED: Esta funcionalidade foi movida para o backend
// Mantido apenas para compatibilidade com código legado

/**
 * @deprecated Use backend sanitization via secure_auth_attempt ou sanitize_input_centralized
 */
export const sanitizeInput = (input: string | null | undefined): string | null | undefined => {
  console.warn('sanitizeInput is deprecated. Use backend sanitization instead.');
  return input;
};

/**
 * @deprecated Use backend sanitization via validate_cliente_security
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  console.warn('sanitizeObject is deprecated. Use backend validation instead.');
  return obj;
};

/**
 * @deprecated Use backend sanitization via secure_auth_attempt
 */
export const sanitizeLoginData = (email: string, password: string) => {
  console.warn('sanitizeLoginData is deprecated. Use secure_auth_attempt instead.');
  return { email, password };
};

/**
 * @deprecated Use backend sanitization via secure_auth_attempt
 */
export const sanitizeSignupData = (email: string, password: string, nome: string) => {
  console.warn('sanitizeSignupData is deprecated. Use secure_auth_attempt instead.');
  return { email, password, nome };
};
