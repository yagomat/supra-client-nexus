
import { v4 as uuidv4 } from 'uuid';

// Chave para armazenar token CSRF no localStorage
const CSRF_TOKEN_KEY = 'app_csrf_token';

// Gerar um novo token CSRF
export const generateCSRFToken = (): string => {
  const token = uuidv4();
  localStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
};

// Obter o token CSRF atual
export const getCSRFToken = (): string => {
  let token = localStorage.getItem(CSRF_TOKEN_KEY);
  
  // Se não existir um token, criar um novo
  if (!token) {
    token = generateCSRFToken();
  }
  
  return token;
};

// Verificar se o token CSRF é válido
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = localStorage.getItem(CSRF_TOKEN_KEY);
  return storedToken === token;
};

// Adicionar token CSRF a um formulário
export const appendCSRFToken = (formData: FormData): FormData => {
  formData.append('csrf_token', getCSRFToken());
  return formData;
};

// Adicionar token CSRF a um objeto
export const appendCSRFTokenToObject = <T extends Object>(obj: T): T & {csrf_token: string} => {
  return {
    ...obj,
    csrf_token: getCSRFToken()
  };
};
