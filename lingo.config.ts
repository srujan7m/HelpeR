/**
 * Lingo Configuration
 * Defines how the compiler extracts and processes translations
 */

export default {
  /**
   * Source locale (the language you write code in)
   */
  sourceLocale: 'en',

  /**
   * Target locales
   * 'auto' means unlimited - any language can be generated
   */
  targetLocales: 'auto',

  /**
   * Extraction configuration
   * Tells the compiler where to find translatable strings
   */
  extract: {
    include: [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'lib/**/*.{ts,tsx}',
    ],
    exclude: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
    ],
    // Function patterns to detect translatable strings
    patterns: [
      't(',           // t('Hello')
      'tv(',          // tv('Hello {name}', { name })
      'tp(',          // tp('item', count, { ... })
      'ts(',          // ts(dict, 'Hello')
    ],
  },

  /**
   * Output configuration
   * Where to store extracted and translated strings
   */
  output: {
    path: './locales',
    format: 'json',
    // Structure: flat or nested
    structure: 'flat',
  },

  /**
   * Translation service configuration
   */
  translation: {
    // Provider: 'google', 'deepl', 'azure'
    provider: process.env.TRANSLATION_PROVIDER || 'google',
    
    // API key from environment
    apiKey: process.env.LINGO_API_KEY || process.env.TRANSLATION_API_KEY,
  },

  /**
   * Validation rules
   */
  validation: {
    // Fail build if translations are missing
    strictMode: true,
    
    // Minimum translation coverage (%)
    minCoverage: 100,
    
    // Warn on unused translations
    warnUnused: true,
  },

  /**
   * Popular languages to generate by default
   */
  defaultLanguages: [
    'en', // English
    'hi', // Hindi
    'es', // Spanish
    'fr', // French
    'de', // German
    'zh', // Chinese
    'ja', // Japanese
    'ko', // Korean
    'ar', // Arabic
    'pt', // Portuguese
    'ru', // Russian
    'it', // Italian
  ],
};
