
import { Cliente, Pagamento } from "@/types";
import { calculatePaymentStatus } from "@/hooks/cliente/paymentCalculationUtils";

export type TemplateType = 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago';

export const determinarTemplatePadrao = (
  cliente: Cliente,
  allPayments: Pagamento[]
): TemplateType => {
  const paymentStatus = calculatePaymentStatus(cliente, allPayments);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Para clientes inativos, sempre mostrar "vencido"
  if (cliente.status === 'inativo') {
    return 'vencido';
  }
  
  // Para clientes ativos, aplicar lógica baseada no status de pagamento
  if (paymentStatus.type !== 'no_info' && paymentStatus.nextDueDate) {
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Verificar se tem pagamento no mês atual
    const currentMonthPayment = allPayments.find(p => 
      p.ano === currentYear && 
      p.mes === currentMonth && 
      (p.status === 'pago' || p.status === 'pago_confianca')
    );
    
    // Regra 1: "Pago" (prioridade máxima) - até 3 dias antes do próximo vencimento
    if (currentMonthPayment) {
      const nextDueDate = new Date(paymentStatus.nextDueDate);
      nextDueDate.setHours(0, 0, 0, 0);
      
      // Calcular data limite (3 dias antes do vencimento)
      const threeDaysBeforeDue = new Date(nextDueDate);
      threeDaysBeforeDue.setDate(threeDaysBeforeDue.getDate() - 3);
      
      // Se ainda estamos dentro dos 3 dias após pagamento, mostrar "pago"
      if (today <= threeDaysBeforeDue) {
        return 'pago';
      }
    }
    
    // Regra 2: "Vence hoje" - quando vence exatamente hoje
    if (paymentStatus.type === 'today') {
      return 'vence_hoje';
    }
    
    // Regra 3: "A vencer" - quando vai vencer nos próximos dias
    if (paymentStatus.type === 'upcoming') {
      return 'a_vencer';
    }
    
    // Regra 4: "Vencido" - quando já passou do vencimento
    if (paymentStatus.type === 'overdue') {
      return 'vencido';
    }
  }
  
  // Fallback: se não conseguir determinar, usar "a_vencer" para ativos
  return cliente.status === 'ativo' ? 'a_vencer' : 'vencido';
};
