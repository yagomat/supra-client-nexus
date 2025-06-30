
import { useState, useEffect } from 'react';
import { capacitorOverlayService, OverlayConfig } from '../services/capacitorOverlayService';

export const useCapacitorOverlay = () => {
  const [config, setConfig] = useState<OverlayConfig>(capacitorOverlayService.getConfig());

  useEffect(() => {
    const unsubscribe = capacitorOverlayService.subscribe(setConfig);
    return unsubscribe;
  }, []);

  const showOverlay = () => capacitorOverlayService.showOverlay();
  const hideOverlay = () => capacitorOverlayService.hideOverlay();
  const updatePosition = (x: number, y: number) => capacitorOverlayService.updatePosition(x, y);

  return {
    config,
    showOverlay,
    hideOverlay,
    updatePosition,
    isVisible: config.isVisible
  };
};
