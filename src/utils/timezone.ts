
import { format, parseISO } from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

// Timezone padrão do sistema (horário de Brasília)
export const SYSTEM_TIMEZONE = "America/Sao_Paulo";

/**
 * Obtém a data atual no timezone do sistema
 */
export function getCurrentDateInSystemTimezone(): Date {
  return toZonedTime(new Date(), SYSTEM_TIMEZONE);
}

/**
 * Obtém apenas a data atual (sem horário) no timezone do sistema
 */
export function getCurrentDateOnlyInSystemTimezone(): Date {
  const now = getCurrentDateInSystemTimezone();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Converte uma data para o timezone do sistema
 */
export function toSystemTimezone(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, SYSTEM_TIMEZONE);
}

/**
 * Converte uma data do timezone do sistema para UTC
 */
export function fromSystemTimezone(date: Date): Date {
  return fromZonedTime(date, SYSTEM_TIMEZONE);
}

/**
 * Formata uma data no timezone do sistema
 */
export function formatDateInSystemTimezone(
  date: Date | string,
  formatStr: string = "dd/MM/yyyy"
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, SYSTEM_TIMEZONE, formatStr, { locale: ptBR });
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
  const now = getCurrentDateInSystemTimezone();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    date: now
  };
}

/**
 * Verifica se uma data está no futuro considerando o timezone do sistema
 */
export function isDateInFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const dateInSystemTz = toSystemTimezone(dateObj);
  const nowInSystemTz = getCurrentDateInSystemTimezone();
  
  return dateInSystemTz > nowInSystemTz;
}

/**
 * Verifica se uma data é hoje considerando o timezone do sistema
 */
export function isDateToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const dateInSystemTz = toSystemTimezone(dateObj);
  const nowInSystemTz = getCurrentDateInSystemTimezone();
  
  return (
    dateInSystemTz.getDate() === nowInSystemTz.getDate() &&
    dateInSystemTz.getMonth() === nowInSystemTz.getMonth() &&
    dateInSystemTz.getFullYear() === nowInSystemTz.getFullYear()
  );
}

/**
 * Calcula a diferença em dias entre duas datas no timezone do sistema
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const date1InSystemTz = toSystemTimezone(date1);
  const date2InSystemTz = toSystemTimezone(date2);
  
  const date1Only = new Date(date1InSystemTz.getFullYear(), date1InSystemTz.getMonth(), date1InSystemTz.getDate());
  const date2Only = new Date(date2InSystemTz.getFullYear(), date2InSystemTz.getMonth(), date2InSystemTz.getDate());
  
  const diffTime = date2Only.getTime() - date1Only.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
