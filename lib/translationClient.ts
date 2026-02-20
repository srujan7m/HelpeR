/**
 * Translation Client for HelpeR Platform
 * Uses the Lingo SDK for runtime dynamic translations
 * For static UI strings, use the compiler (npm run i18n:extract)
 */

import { createLingoClient } from './lingo/sdk';

// Singleton instance
let translationClient: ReturnType<typeof createLingoClient> | null = null;

export function getTranslationClient() {
  if (!translationClient) {
    const apiKey = process.env.LINGO_API_KEY || process.env.TRANSLATION_API_KEY || '';
    const provider = (process.env.TRANSLATION_PROVIDER as 'google' | 'deepl' | 'azure') || 'google';
    
    translationClient = createLingoClient({
      apiKey,
      provider,
    });
  }
  return translationClient;
}

// Re-export types
export type { TranslateTextOptions, LingoClientConfig } from './lingo/sdk';
