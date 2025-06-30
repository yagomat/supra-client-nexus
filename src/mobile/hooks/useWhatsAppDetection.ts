
import { useState, useEffect } from 'react';
import { whatsappMonitor, WhatsAppContact } from '../services/whatsappMonitor';

export const useWhatsAppDetection = () => {
  const [currentContact, setCurrentContact] = useState<WhatsAppContact | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    const unsubscribe = whatsappMonitor.subscribe(setCurrentContact);
    return unsubscribe;
  }, []);

  const startMonitoring = async () => {
    await whatsappMonitor.startMonitoring();
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    whatsappMonitor.stopMonitoring();
    setIsMonitoring(false);
  };

  return {
    currentContact,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
};
