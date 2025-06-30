
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface CapacitorInfo {
  platform: string;
  isNative: boolean;
  version?: string;
}

export const useCapacitor = () => {
  const [isReady, setIsReady] = useState(false);
  const [info, setInfo] = useState<CapacitorInfo>({
    platform: 'web',
    isNative: false
  });

  useEffect(() => {
    const initializeCapacitor = async () => {
      try {
        const platform = Capacitor.getPlatform();
        const isNative = Capacitor.isNativePlatform();
        
        setInfo({
          platform,
          isNative,
          version: '5.0.0' // Current Capacitor version
        });
        
        setIsReady(true);
        console.log('Capacitor initialized:', { platform, isNative });
      } catch (error) {
        console.error('Error initializing Capacitor:', error);
        setIsReady(true); // Still mark as ready for web fallback
      }
    };

    initializeCapacitor();
  }, []);

  return {
    isReady,
    info,
    isNative: info.isNative,
    platform: info.platform
  };
};
