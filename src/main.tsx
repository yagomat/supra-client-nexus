
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { replaceUnsafeLogs } from "./utils/secureLogger";

// Inicializar sistema de logging seguro
replaceUnsafeLogs();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
