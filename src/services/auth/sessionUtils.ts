
// Configurar expiração de sessão (8 horas)
export const setupSessionExpiration = (callback: () => void): number => {
  return window.setTimeout(callback, 8 * 60 * 60 * 1000);
};
