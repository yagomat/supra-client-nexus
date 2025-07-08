
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditEvent } from "./auditLog";
import { setupSessionExpiration } from "./sessionUtils";

// Exportações refatoradas - funções movidas para arquivos específicos
export { secureSignIn } from "./authLogin";
export { secureSignUp } from "./authSignup";
export { updatePassword } from "./authPassword";
export { secureSignOut, signOutAll } from "./authLogout";
export { logAuditEvent } from "./auditLog";
