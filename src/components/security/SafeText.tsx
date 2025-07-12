
import React from 'react';
import { sanitizeHtml, sanitizeText } from '@/utils/xssSanitizer';

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

  // Se permitir HTML básico, renderizar com dangerouslySetInnerHTML (já sanitizado)
  if (allowBasicHtml && sanitizedContent !== sanitizeText(children)) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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
