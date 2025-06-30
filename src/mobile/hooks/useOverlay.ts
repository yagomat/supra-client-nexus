
import { useState, useEffect } from 'react';
import { overlayService, OverlayConfig } from '../services/overlayService';

export const useOverlay = () => {
  const [config, setConfig] = useState<OverlayConfig>(overlayService.getConfig());

  useEffect(() => {
    const unsubscribe = overlayService.subscribe(setConfig);
    return unsubscribe;
  }, []);

  const showOverlay = () => overlayService.showOverlay();
  const hideOverlay = () => overlayService.hideOverlay();
  const updatePosition = (x: number, y: number) => overlayService.updatePosition(x, y);

  return {
    config,
    showOverlay,
    hideOverlay,
    updatePosition,
    isVisible: config.isVisible
  };
};
