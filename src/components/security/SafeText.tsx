
import React from 'react';
import { sanitizeHtml, sanitizeText, validateSanitizedContent } from '@/utils/xssSanitizer';

interface SafeTextProps {
  children: string | null | undefined;
  /** Se true, permite tags HTML básicas (b, i, u, strong, em, br, p) */
  allowBasicHtml?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Se true, preserva quebras de linha */
  preserveLineBreaks?: boolean;
}

/**
 * Componente para renderização segura de texto com proteção contra XSS
 */
export const SafeText: React.FC<SafeTextProps> = ({
  children,
  allowBasicHtml = false,
  className = '',
  preserveLineBreaks = false
}) => {
  if (!children) return null;

  const sanitizedContent = allowBasicHtml 
    ? sanitizeHtml(children)
    : sanitizeText(children);

  if (!sanitizedContent) return null;

  // Se permitir HTML básico, validar segurança antes de renderizar
  if (allowBasicHtml && sanitizedContent !== sanitizeText(children)) {
    // Validação dupla de segurança
    if (!validateSanitizedContent(sanitizedContent)) {
      console.warn('Conteúdo HTML rejeitado por questões de segurança, usando texto puro');
      const safeTextContent = sanitizeText(children);
      
      const finalContent = preserveLineBreaks 
        ? safeTextContent.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < safeTextContent.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))
        : safeTextContent;

      return <span className={className}>{finalContent}</span>;
    }

    // Renderizar HTML sanitizado apenas se passou em todas as validações
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ 
          __html: sanitizedContent 
        }}
      />
    );
  }

  // Para texto puro, renderizar normalmente
  const finalContent = preserveLineBreaks 
    ? sanitizedContent.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < sanitizedContent.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))
    : sanitizedContent;

  return (
    <span className={className}>
      {finalContent}
    </span>
  );
};
