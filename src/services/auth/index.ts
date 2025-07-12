
// Re-export all authentication functions
export * from "./schemas";
export * from "./rateLimit";
export * from "./auditLog";
export * from "./passwordUtils";
export * from "./sessionUtils";
export * from "./authCore";
export * from "./dataSanitization";

// Resolve conflict: use the enhanced version from auditLog
export { logAuditEvent as logAuthAttempt } from "./auditLog";
