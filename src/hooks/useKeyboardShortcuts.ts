import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Only trigger on Ctrl combinations (or Cmd on Mac)
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "n":
          event.preventDefault();
          navigate("/clientes/cadastrar");
          break;
        case "l":
          event.preventDefault();
          navigate("/clientes");
          break;
        case "d":
          event.preventDefault();
          navigate("/banco-dados");
          break;
        case "t":
          event.preventDefault();
          navigate("/templates");
          break;
        case "h":
          event.preventDefault();
          navigate("/dashboard");
          break;
        case ",":
          event.preventDefault();
          navigate("/configuracoes");
          break;
        case "k":
          event.preventDefault();
          // This could trigger a command palette or quick actions
          break;
        case "/":
          event.preventDefault();
          // Focus search if available
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Pesquisar"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, location]);
}