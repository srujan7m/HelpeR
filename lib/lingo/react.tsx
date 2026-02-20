/**
 * @lingo.dev/react compatible implementation
 * React hooks and components for translation
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TranslationContextValue {
  lang: string;
  translations: Record<string, string>;
}

const TranslationContext = createContext<TranslationContextValue>({
  lang: 'en',
  translations: {},
});

interface TranslationProviderProps {
  lang: string;
  translations: Record<string, string>;
  children: ReactNode;
}

/**
 * Provider for translation context
 */
export function TranslationProvider({
  lang,
  translations,
  children,
}: TranslationProviderProps) {
  return (
    <TranslationContext.Provider value={{ lang, translations }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to access current language
 */
export function useLanguage() {
  const { lang } = useContext(TranslationContext);
  return lang;
}

/**
 * Hook to access translations
 */
export function useTranslations() {
  const { translations } = useContext(TranslationContext);
  return translations;
}

/**
 * Main translation function (compiler will extract these)
 * Usage: t('Welcome to HelpeR')
 */
export function t(key: string, fallback?: string): string {
  const { translations } = useContext(TranslationContext);
  return translations[key] || fallback || key;
}

/**
 * Translation function with variables
 * Usage: tv('Hello {name}', { name: 'John' })
 */
export function tv(
  key: string,
  variables: Record<string, string | number>,
  fallback?: string
): string {
  const { translations } = useContext(TranslationContext);
  let text = translations[key] || fallback || key;

  // Replace variables
  Object.keys(variables).forEach((varKey) => {
    text = text.replace(`{${varKey}}`, String(variables[varKey]));
  });

  return text;
}

/**
 * Plural translation function
 * Usage: tp('item', count, { one: '1 item', other: '{count} items' })
 */
export function tp(
  key: string,
  count: number,
  plurals: { one?: string; other: string },
  variables?: Record<string, string | number>
): string {
  const { translations } = useContext(TranslationContext);
  
  let text: string;
  if (count === 1 && plurals.one) {
    text = translations[`${key}.one`] || plurals.one;
  } else {
    text = translations[`${key}.other`] || plurals.other;
  }

  // Replace count variable
  text = text.replace('{count}', String(count));

  // Replace other variables if provided
  if (variables) {
    Object.keys(variables).forEach((varKey) => {
      text = text.replace(`{${varKey}}`, String(variables[varKey]));
    });
  }

  return text;
}

/**
 * Server-side translation function
 * (Does not use context, requires translations to be passed)
 */
export function ts(
  translations: Record<string, string>,
  key: string,
  fallback?: string
): string {
  return translations[key] || fallback || key;
}
