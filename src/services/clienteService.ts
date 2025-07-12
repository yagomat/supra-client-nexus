
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { SecureClienteService } from "./secureClienteService";

// Re-exportar todas as funcionalidades do SecureClienteService
export const getClientes = SecureClienteService.getClientes;
export const getCliente = SecureClienteService.getCliente;
export const createCliente = SecureClienteService.createCliente;
export const updateCliente = SecureClienteService.updateCliente;
export const deleteCliente = SecureClienteService.deleteCliente;
export const searchClientes = SecureClienteService.searchClientes;
export const getClientesWithCalculatedStatus = SecureClienteService.getClientesWithCalculatedStatus;
export const calculatePaymentStatus = SecureClienteService.calculatePaymentStatus;
export const checkOperationRateLimit = SecureClienteService.checkOperationRateLimit;

// Manter apenas funcionalidades específicas que não existem no SecureClienteService
// (neste caso, não há nenhuma funcionalidade única restante)
