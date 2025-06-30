import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { AppRoutes } from "./Routes";
import { OverlayWindow } from "./mobile/components/OverlayWindow";
import { useEffect } from "react";
import { overlayService } from "./mobile/services/overlayService";
import { whatsappMonitor } from "./mobile/services/whatsappMonitor";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize mobile services on app start
    const initializeMobile = async () => {
      try {
        await overlayService.initialize();
        await whatsappMonitor.startMonitoring();
        console.log('Mobile services initialized');
      } catch (error) {
        console.error('Error initializing mobile services:', error);
      }
    };

    // Check if running on mobile
    if (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
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
              <OverlayWindow />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
