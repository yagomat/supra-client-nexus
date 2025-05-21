
declare module 'dompurify' {
  export interface DOMPurifyI {
    sanitize(
      dirty: string,
      options?: {
        USE_PROFILES?: { 
          html?: boolean;
          mathMl?: boolean;
          svg?: boolean;
          svgFilters?: boolean;
          [key: string]: boolean | undefined;
        };
        [key: string]: any;
      }
    ): string;
  }

  const DOMPurify: DOMPurifyI;
  export default DOMPurify;
}
