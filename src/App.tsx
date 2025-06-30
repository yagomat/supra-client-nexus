
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AppRoutes } from "./Routes";
import { CapacitorOverlayWindow } from "./mobile/components/CapacitorOverlayWindow";
import { useEffect } from "react";
import { capacitorOverlayService } from "./mobile/services/capacitorOverlayService";
import { whatsappMonitor } from "./mobile/services/whatsappMonitor";
import { Capacitor } from "@capacitor/core";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize mobile services on app start
    const initializeMobile = async () => {
      try {
        await capacitorOverlayService.initialize();
        await whatsappMonitor.startMonitoring();
        
        console.log('Capacitor mobile services initialized', {
          platform: Capacitor.getPlatform(),
          isNative: Capacitor.isNativePlatform()
        });
      } catch (error) {
        console.error('Error initializing Capacitor mobile services:', error);
      }
    };

    // Check if running on mobile or native platform
    if (Capacitor.isNativePlatform() || window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      initializeMobile();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <CapacitorOverlayWindow />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
