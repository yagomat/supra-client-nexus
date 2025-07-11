
import { format, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

// Timezone padrão do sistema (horário de Brasília)
export const SYSTEM_TIMEZONE = "America/Sao_Paulo";

/**
 * Obtém a data atual no timezone do sistema
 */
export function getCurrentDateInSystemTimezone(): Date {
  try {
    return toZonedTime(new Date(), SYSTEM_TIMEZONE);
  } catch (error) {
    console.warn('Error getting date in system timezone:', error);
    return new Date(); // Fallback para data local
  }
}

/**
 * Obtém apenas a data atual (sem horário) no timezone do sistema
 */
export function getCurrentDateOnlyInSystemTimezone(): Date {
  try {
    const now = getCurrentDateInSystemTimezone();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } catch (error) {
    console.warn('Error getting date only in system timezone:', error);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}

/**
 * Converte uma data para o timezone do sistema
 */
export function toSystemTimezone(date: Date | string): Date {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return toZonedTime(dateObj, SYSTEM_TIMEZONE);
  } catch (error) {
    console.warn('Error converting to system timezone:', error);
    return typeof date === 'string' ? parseISO(date) : date;
  }
}

/**
 * Converte uma data do timezone do sistema para UTC
 */
export function fromSystemTimezone(date: Date): Date {
  try {
    return fromZonedTime(date, SYSTEM_TIMEZONE);
  } catch (error) {
    console.warn('Error converting from system timezone:', error);
    return date;
  }
}

/**
 * Formata uma data no timezone do sistema
 */
export function formatDateInSystemTimezone(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy"
): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatInTimeZone(dateObj, SYSTEM_TIMEZONE, formatStr, { locale: ptBR });
  } catch (error) {
    console.warn('Error formatting date in system timezone:', error);
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: ptBR });
  }
}

/**
 * Formata uma data e hora no timezone do sistema
 */
export function formatDateTimeInSystemTimezone(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy HH:mm:ss"
): string {
  return formatDateInSystemTimezone(date, formatStr);
}

/**
 * Obtém informações sobre o dia atual no sistema
 */
export function getCurrentDayInfo() {
  try {
    const now = getCurrentDateInSystemTimezone();
    return {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      date: now
    };
  } catch (error) {
    console.warn('Error getting current day info:', error);
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      date: now
    };
  }
}

/**
 * Verifica se uma data está no futuro considerando o timezone do sistema
 */
export function isDateInFuture(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const dateInSystemTz = toSystemTimezone(dateObj);
    const nowInSystemTz = getCurrentDateInSystemTimezone();
    
    return dateInSystemTz > nowInSystemTz;
  } catch (error) {
    console.warn('Error checking if date is in future:', error);
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj > new Date();
  }
}

/**
 * Verifica se uma data é hoje considerando o timezone do sistema
 */
export function isDateToday(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const dateInSystemTz = toSystemTimezone(dateObj);
    const nowInSystemTz = getCurrentDateInSystemTimezone();
    
    return (
      dateInSystemTz.getDate() === nowInSystemTz.getDate() &&
      dateInSystemTz.getMonth() === nowInSystemTz.getMonth() &&
      dateInSystemTz.getFullYear() === nowInSystemTz.getFullYear()
    );
  } catch (error) {
    console.warn('Error checking if date is today:', error);
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    return (
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear()
    );
  }
}

/**
 * Calcula a diferença em dias entre duas datas no timezone do sistema
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  try {
    const date1InSystemTz = toSystemTimezone(date1);
    const date2InSystemTz = toSystemTimezone(date2);
    
    const date1Only = new Date(date1InSystemTz.getFullYear(), date1InSystemTz.getMonth(), date1InSystemTz.getDate());
    const date2Only = new Date(date2InSystemTz.getFullYear(), date2InSystemTz.getMonth(), date2InSystemTz.getDate());
    
    const diffTime = date2Only.getTime() - date1Only.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.warn('Error calculating days difference:', error);
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    const diffTime = dateObj2.getTime() - dateObj1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}
