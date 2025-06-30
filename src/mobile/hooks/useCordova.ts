
import { useState, useEffect } from 'react';

interface CordovaDevice {
  platform: string;
  version: string;
  model: string;
  manufacturer: string;
}

export const useCordova = () => {
  const [isReady, setIsReady] = useState(false);
  const [device, setDevice] = useState<CordovaDevice | null>(null);

  useEffect(() => {
    const onDeviceReady = () => {
      console.log('Cordova device ready');
      setIsReady(true);
      
      // Verificar se o plugin device está disponível
      if (window.device) {
        setDevice({
          platform: window.device.platform,
          version: window.device.version,
          model: window.device.model,
          manufacturer: window.device.manufacturer
        });
      }
    };

    // Se Cordova estiver disponível, aguardar o evento deviceready
    if (typeof window !== 'undefined' && window.cordova) {
      document.addEventListener('deviceready', onDeviceReady, false);
    } else {
      // Se não estiver no Cordova (desenvolvimento), marcar como pronto
      setIsReady(true);
    }

    return () => {
      if (typeof window !== 'undefined' && window.cordova) {
        document.removeEventListener('deviceready', onDeviceReady, false);
      }
    };
  }, []);

  const isCordova = typeof window !== 'undefined' && !!window.cordova;

  return {
    isReady,
    isCordova,
    device
  };
};

// Declarações TypeScript para Cordova
declare global {
  interface Window {
    cordova: any;
    device: {
      platform: string;
      version: string;
      model: string;
      manufacturer: string;
    };
  }
}
