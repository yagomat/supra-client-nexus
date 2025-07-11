/**
 * LocalStorage criptografado para dados sensíveis
 */

// Usando Web Crypto API nativa do browser
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Gera uma chave de criptografia baseada em uma senha
 */
const deriveKey = async (password: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('supabase-client-salt'), // Salt fixo para consistência
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Criptografa dados para armazenamento
 */
const encrypt = async (data: string, key: CryptoKey): Promise<string> => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );
  
  // Combina IV + dados criptografados em uma string base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

/**
 * Descriptografa dados do armazenamento
 */
const decrypt = async (encryptedData: string, key: CryptoKey): Promise<string> => {
  try {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Gera uma senha baseada no usuário logado
 */
const getUserSeed = (): string => {
  // Usar informações do browser + timestamp de instalação para gerar seed único
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Tentar recuperar ou gerar um ID único para esta instalação
  let installId = localStorage.getItem('__app_install_id');
  if (!installId) {
    installId = crypto.getRandomValues(new Uint32Array(4)).join('-');
    localStorage.setItem('__app_install_id', installId);
  }
  
  return `${userAgent}-${language}-${timezone}-${installId}`;
};

/**
 * Interface para o storage criptografado
 */
export class CryptoStorage {
  private static key: CryptoKey | null = null;
  
  private static async getKey(): Promise<CryptoKey> {
    if (!this.key) {
      const seed = getUserSeed();
      this.key = await deriveKey(seed);
    }
    return this.key;
  }
  
  /**
   * Armazena dados criptografados
   */
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const cryptoKey = await this.getKey();
      const jsonString = JSON.stringify(value);
      const encrypted = await encrypt(jsonString, cryptoKey);
      localStorage.setItem(`enc_${key}`, encrypted);
    } catch (error) {
      console.error('CryptoStorage.setItem failed:', error);
      // Fallback para localStorage normal em caso de erro
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  
  /**
   * Recupera dados descriptografados
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const encryptedKey = `enc_${key}`;
      const encrypted = localStorage.getItem(encryptedKey);
      
      if (!encrypted) {
        // Tentar fallback para localStorage normal
        const fallback = localStorage.getItem(key);
        if (fallback) {
          try {
            return JSON.parse(fallback) as T;
          } catch {
            return fallback as T;
          }
        }
        return null;
      }
      
      const cryptoKey = await this.getKey();
      const decrypted = await decrypt(encrypted, cryptoKey);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('CryptoStorage.getItem failed:', error);
      
      // Tentar fallback para localStorage normal
      const fallback = localStorage.getItem(key);
      if (fallback) {
        try {
          return JSON.parse(fallback) as T;
        } catch {
          return fallback as T;
        }
      }
      return null;
    }
  }
  
  /**
   * Remove item do storage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(`enc_${key}`);
    localStorage.removeItem(key); // Remove fallback também
  }
  
  /**
   * Verifica se um item existe
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(`enc_${key}`) !== null || 
           localStorage.getItem(key) !== null;
  }
  
  /**
   * Limpa todos os dados criptografados
   */
  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('enc_')) {
        localStorage.removeItem(key);
      }
    });
  }
}