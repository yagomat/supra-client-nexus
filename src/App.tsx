
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AppRoutes } from "./Routes";
import { CordovaOverlayWindow } from "./mobile/components/CordovaOverlayWindow";
import { useEffect } from "react";
import { cordovaOverlayService } from "./mobile/services/cordovaOverlayService";
import { whatsappMonitor } from "./mobile/services/whatsappMonitor";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize mobile services on app start
    const initializeMobile = async () => {
      try {
        await cordovaOverlayService.initialize();
        await whatsappMonitor.startMonitoring();
        console.log('Cordova mobile services initialized');
      } catch (error) {
        console.error('Error initializing Cordova mobile services:', error);
      }
    };

    // Check if running on mobile or Cordova
    if (window.cordova || window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
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
              <CordovaOverlayWindow />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
