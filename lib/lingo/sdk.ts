/**
 * @lingo.dev/sdk compatible implementation
 * Provides runtime translation capabilities for dynamic content
 */

interface TranslateTextOptions {
  text: string;
  source: string;
  target: string;
}

interface LingoClientConfig {
  apiKey: string;
  provider?: 'google' | 'deepl' | 'azure';
}

class LingoSDK {
  private apiKey: string;
  private provider: string;

  constructor(config: LingoClientConfig) {
    this.apiKey = config.apiKey;
    this.provider = config.provider || 'google';
  }

  /**
   * Translate text at runtime (for dynamic content)
   */
  async translateText(options: TranslateTextOptions): Promise<string> {
    const { text, source, target } = options;

    // Same language - return as is
    if (source === target) {
      return text;
    }

    try {
      // Google Translate API implementation
      if (this.provider === 'google') {
        if (this.apiKey) {
          const response = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                q: text,
                source,
                target,
                format: 'text',
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            return data.data.translations[0].translatedText;
          }
        }

        // Fallback endpoint when API key is missing/invalid.
        const fallbackResponse = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const translatedText = Array.isArray(fallbackData?.[0])
            ? fallbackData[0].map((part: any[]) => part?.[0] ?? '').join('')
            : '';
          if (translatedText) {
            return translatedText;
          }
        }

        throw new Error('Google translation fallback failed');
      }

      // DeepL API implementation
      if (this.provider === 'deepl') {
        const response = await fetch('https://api-free.deepl.com/v2/translate', {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text,
            source_lang: source.toUpperCase(),
            target_lang: target.toUpperCase(),
          }),
        });

        if (!response.ok) {
          throw new Error(`DeepL API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.translations[0].text;
      }

      // Fallback to original text if no provider configured
      console.warn(`Translation provider "${this.provider}" not configured. Returning original text.`);
      return text;

    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to original text on error
      return text;
    }
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(
    texts: string[],
    source: string,
    target: string
  ): Promise<string[]> {
    if (source === target) {
      return texts;
    }

    try {
      if (this.provider === 'google') {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: texts,
              source,
              target,
              format: 'text',
            }),
          }
        );

        const data = await response.json();
        return data.data.translations.map((t: any) => t.translatedText);
      }

      // Fallback to individual translations
      return Promise.all(
        texts.map((text) => this.translateText({ text, source, target }))
      );
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    }
  }
}

/**
 * Create a Lingo SDK client instance
 */
export function createLingoClient(config: LingoClientConfig): LingoSDK {
  return new LingoSDK(config);
}

export type { TranslateTextOptions, LingoClientConfig };
export { LingoSDK };
