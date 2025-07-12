
# Guia de Logging Seguro

## ⚠️ CRÍTICO: Exposição de Dados Sensíveis

Este projeto implementou um sistema de logging seguro para prevenir a exposição acidental de dados sensíveis nos logs.

## Como usar o novo sistema

### ✅ Logs Seguros (USE ESTES)

```typescript
import { secureLog } from "@/utils/secureLogger";
import { clienteLogger, authLogger } from "@/utils/contextualLogger";

// Logs básicos
secureLog.info("Operação realizada", { count: 5 });
secureLog.error("Erro encontrado", { error: "message" });
secureLog.devOnly("Debug info", data); // Só aparece em desenvolvimento

// Logs contextuais
clienteLogger.operacao("criado", { id: "masked-id" });
authLogger.tentativa("login", "user@example.com");
```

### ❌ Logs Inseguros (NÃO USE)

```typescript
// NUNCA FAÇA ISSO:
console.log("Cliente:", cliente); // Expõe dados sensíveis
console.info("User data:", userData); // Expõe informações pessoais
console.warn("Payment:", pagamento); // Expõe dados financeiros
```

## Níveis de Log

- **Production**: Apenas logs de erro crítico
- **Development**: Todos os logs, com mascaramento de dados sensíveis
- **Critical**: Sempre logado, mesmo em produção (para alertas de segurança)

## Dados Automaticamente Mascarados

- IDs (mostra apenas 8 primeiros caracteres)
- Nomes (mostra apenas primeira letra)
- Emails, telefones, senhas (completamente mascarados)
- Dados financeiros (valores, pagamentos)
- Credenciais de aplicativos

## Migração de Código Existente

1. Substitua `console.log()` por `secureLog.info()` ou `secureLog.devOnly()`
2. Use loggers contextuais para operações específicas
3. Para debug, prefira `secureLog.devOnly()`
4. Para erros, use `secureLog.error()` ou `logError()`

## Alertas de Segurança

O sistema detecta automaticamente:
- Tentativas de log inseguro (desenvolvimento)
- Erros não capturados (produção)
- Promises rejeitadas (produção)

## Status da Migração

- ✅ Sistema de logging seguro implementado
- ✅ Detecção de logs inseguros ativa
- ✅ Mascaramento automático de dados sensíveis
- ✅ Logs contextuais para diferentes módulos
- ⚠️ Arquivos restantes precisam ser migrados gradualmente

## Próximos Passos

1. Migrar todos os `console.log` restantes
2. Implementar alertas por email para logs críticos
3. Criar dashboard de monitoramento de logs
4. Adicionar métricas de segurança

**IMPORTANTE**: Em produção, apenas logs de erro crítico são exibidos para prevenir exposição de dados sensíveis.
