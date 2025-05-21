
import DOMPurify from 'dompurify';

// Sanitizar texto para prevenir XSS
export const sanitizeInput = (input: string | null | undefined): string | null | undefined => {
    if (!input) return input;
    return DOMPurify.sanitize(input, {
        USE_PROFILES: {
            html: false
        }
    });
};

// Sanitizar objeto inteiro
export const sanitizeObject = <T extends Record<string, any>>(obj: T): Record<string, any> => {
    const result: Record<string, any> = { ...obj };

    Object.keys(result).forEach((key) => {
        const value = result[key];
        if (typeof value === 'string') {
            result[key] = sanitizeInput(value);
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = sanitizeObject(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) => 
                typeof item === 'string' 
                    ? sanitizeInput(item) 
                    : typeof item === 'object' && item !== null
                        ? sanitizeObject(item) 
                        : item
            );
        }
    });

    return result as T;
};

// Sanitizar corpo de requisição específico para login
export const sanitizeLoginData = (email: string, password: string): { email: string | null | undefined; password: string } => {
    return {
        email: sanitizeInput(email),
        password // Password is not sanitized as it would alter the hash
    };
};

// Sanitizar corpo de requisição específico para cadastro
export const sanitizeSignupData = (email: string, password: string, nome: string): { 
    email: string | null | undefined; 
    password: string;
    nome: string | null | undefined;
} => {
    return {
        email: sanitizeInput(email),
        password, // Password is not sanitized
        nome: sanitizeInput(nome)
    };
};
