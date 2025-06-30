
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Minimize2 } from 'lucide-react';
import { useCordovaOverlay } from '../hooks/useCordovaOverlay';
import { ClienteInfo } from './ClienteInfo';
import { TemplatesList } from './TemplatesList';
import { QuickActions } from './QuickActions';

export const OverlayWindow = () => {
  const { config, hideOverlay } = useCordovaOverlay();

  if (!config.isVisible) return null;

  return (
    <div 
      className="fixed z-50 bg-white shadow-lg rounded-lg border"
      style={{
        left: config.position.x,
        top: config.position.y,
        width: config.size.width,
        maxHeight: config.size.height
      }}
    >
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Gestor Connect Mobile (Cordova)</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={hideOverlay}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={hideOverlay}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          <ClienteInfo />
          <TemplatesList />
          <QuickActions />
        </CardContent>
      </Card>
    </div>
  );
};
