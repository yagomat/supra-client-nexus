
// Re-export all service functions for easier imports
export * from './clienteService'; // Agora aponta para as funcionalidades seguras
export * from './pagamentoService';
export * from './valoresPredefinidosService';
export * from './userRoleService';
export * from './clientStatusService';
export * from './clienteExcel';
export * from './auth';
export * from './auditLogService';
export * from './cobrancaService';
export * from './mensagensWhatsApp';
// SecureClienteService ainda disponível para uso direto quando necessário
export { SecureClienteService } from './secureClienteService';
export { ClienteSecurityService } from './clienteSecurityService';
