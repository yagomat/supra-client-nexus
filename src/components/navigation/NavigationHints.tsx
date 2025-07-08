import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const shortcuts = [
  { key: "Ctrl+N", action: "Cadastrar Cliente" },
  { key: "Ctrl+L", action: "Lista de Clientes" },
  { key: "Ctrl+D", action: "Banco de Dados" },
  { key: "Ctrl+T", action: "Templates" },
  { key: "Ctrl+H", action: "Dashboard" },
  { key: "Ctrl+,", action: "Configurações" },
  { key: "Ctrl+/", action: "Focar na busca" },
  { key: "Ctrl+K", action: "Ações rápidas" },
];

export function NavigationHints() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenHints, setHasSeenHints] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("navigation-hints-seen");
    if (!seen) {
      // Show hints after a brief delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenHints(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("navigation-hints-seen", "true");
    setHasSeenHints(true);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible && !hasSeenHints) return null;

  return (
    <>
      {/* Toggle button for returning users */}
      {hasSeenHints && !isVisible && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVisibility}
          className="fixed bottom-6 left-6 z-40 bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card shadow-soft"
          title="Atalhos do teclado"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      )}

      {/* Navigation hints card */}
      {isVisible && (
        <Card className="fixed bottom-6 left-6 z-50 w-80 bg-card/95 backdrop-blur-sm border-border/50 shadow-large animate-scale-in">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-primary" />
                Atalhos do Teclado
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {shortcut.action}
                  </span>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {shortcut.key}
                  </Badge>
                </div>
              ))}
            </div>
            {!hasSeenHints && (
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                Use estes atalhos para navegar rapidamente pelo sistema.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}