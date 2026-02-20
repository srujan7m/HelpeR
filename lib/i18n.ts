/**
 * i18n Configuration for HelpeR Platform
 * Supports unlimited languages dynamically
 */

export const defaultLang = 'en';

/**
 * Validates if a language code is valid
 * Supports ISO 639-1 (2-letter) and regional codes (e.g., en-US, zh-CN)
 */
export function isValidLang(lang: string): boolean {
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(lang);
}

/**
 * Extracts language code from pathname
 * @param pathname - The URL pathname
 * @returns The language code or null
 */
export function getLanguageFromPathname(pathname: string): string | null {
  const segments = pathname.split('/');
  const lang = segments[1];
  return isValidLang(lang) ? lang : null;
}

/**
 * Common languages with their display names (for UI purposes)
 */
export const popularLanguages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' },
  { code: 'ru', name: 'Русский' },
  { code: 'it', name: 'Italiano' },
] as const;
