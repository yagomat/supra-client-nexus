
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { SecurityHeadersProvider } from "./components/security/SecurityHeadersProvider";
import AppRoutes from "./Routes";
import { CapacitorOverlayWindow } from "./mobile/components/CapacitorOverlayWindow";
import { PermissionsSetup } from "./mobile/components/PermissionsSetup";
import { useEffect, useState } from "react";
import { capacitorOverlayService } from "./mobile/services/capacitorOverlayService";
import { whatsappMonitor } from "./mobile/services/whatsappMonitor";
import { permissionsService } from "./mobile/services/permissionsService";
import { Capacitor } from "@capacitor/core";

const queryClient = new QueryClient();

const App = () => {
  const [showPermissionsSetup, setShowPermissionsSetup] = useState(false);

  useEffect(() => {
    // Initialize mobile services on app start
    const initializeMobile = async () => {
      try {
        // Check if we need to show permissions setup
        if (Capacitor.isNativePlatform()) {
          const permissions = await permissionsService.checkPermissions();
          const needsPermissions = !permissions.overlay.granted || !permissions.notifications.granted;
          
          if (needsPermissions) {
            setShowPermissionsSetup(true);
            console.log('Permissões necessárias não foram concedidas, mostrando setup');
          }
        }

        await capacitorOverlayService.initialize();
        await whatsappMonitor.startMonitoring();
        
        console.log('Capacitor mobile services initialized successfully', {
          platform: Capacitor.getPlatform(),
          isNative: Capacitor.isNativePlatform(),
          version: '7.4.0'
        });
      } catch (error) {
        console.error('Error initializing Capacitor mobile services:', error);
      }
    };

    // Check if running on mobile or native platform
    if (Capacitor.isNativePlatform() || window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      console.log('Mobile environment detected, initializing Capacitor services...');
      initializeMobile();
    } else {
      console.log('Web environment detected, Capacitor services will run in simulation mode');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SecurityHeadersProvider 
        environment={process.env.NODE_ENV === 'production' ? 'production' : 'development'}
        showWarnings={process.env.NODE_ENV === 'development'}
      >
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
                <CapacitorOverlayWindow />
                {showPermissionsSetup && Capacitor.isNativePlatform() && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <PermissionsSetup />
                      <div className="p-4 border-t">
                        <button 
                          onClick={() => setShowPermissionsSetup(false)}
                          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                          Fechar (configurar depois)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </SecurityHeadersProvider>
    </QueryClientProvider>
  );
};

export default App;
