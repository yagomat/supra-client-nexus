
import { useState, useEffect } from 'react';
import { cordovaOverlayService, OverlayConfig } from '../services/cordovaOverlayService';

export const useCordovaOverlay = () => {
  const [config, setConfig] = useState<OverlayConfig>(cordovaOverlayService.getConfig());

  useEffect(() => {
    const unsubscribe = cordovaOverlayService.subscribe(setConfig);
    return unsubscribe;
  }, []);

  const showOverlay = () => cordovaOverlayService.showOverlay();
  const hideOverlay = () => cordovaOverlayService.hideOverlay();
  const updatePosition = (x: number, y: number) => cordovaOverlayService.updatePosition(x, y);

  return {
    config,
    showOverlay,
    hideOverlay,
    updatePosition,
    isVisible: config.isVisible
  };
};
