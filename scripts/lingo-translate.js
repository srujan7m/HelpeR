#!/usr/bin/env node

/**
 * Lingo CLI - Translate Tool
 * Translates extracted strings to target languages
 */

const fs = require('fs');
const path = require('path');

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

// Load environment variables
require('dotenv').config();

const apiKey = process.env.LINGO_API_KEY || process.env.TRANSLATION_API_KEY;

if (!apiKey) {
  log('❌ Error: LINGO_API_KEY or TRANSLATION_API_KEY not found in .env', colors.yellow);
  log('   Translation will use fallback (copy source text)', colors.yellow);
}

// Load config
const config = {
  sourceLocale: 'en',
  targetLocales: 'auto',
  output: { path: './locales' },
  defaultLanguages: ['hi', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'pt', 'ru', 'it'],
};

log('\n🌍 Translating strings...\n', colors.blue);

// Get target languages from command line or use defaults
const args = process.argv.slice(2);
const targetArg = args.find((arg) => arg.startsWith('--target='));
let targetLanguages = config.defaultLanguages;

if (targetArg) {
  const targetValue = targetArg.split('=')[1];
  if (targetValue === 'auto') {
    targetLanguages = config.defaultLanguages;
  } else {
    targetLanguages = targetValue.split(',');
  }
}

// Load source translations
const localesDir = path.join(process.cwd(), config.output.path);
const sourceFile = path.join(localesDir, `${config.sourceLocale}.json`);

if (!fs.existsSync(sourceFile)) {
  log(`❌ Error: Source file not found: ${sourceFile}`, colors.yellow);
  log('   Run: npm run i18n:extract first\n', colors.yellow);
  process.exit(1);
}

const sourceTranslations = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
const keys = Object.keys(sourceTranslations);

log(`✓ Loaded ${keys.length} strings from ${config.sourceLocale}.json`, colors.green);

// Translate function (simplified - uses Google Translate API if key available)
async function translateText(text, targetLang) {
  if (!apiKey) {
    // Fallback: return original text
    return text;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: config.sourceLocale,
          target: targetLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error(`Translation error for ${targetLang}:`, error.message);
    return text; // Fallback
  }
}

// Translate to each target language
(async () => {
  for (const targetLang of targetLanguages) {
    const targetFile = path.join(localesDir, `${targetLang}.json`);
    
    // Check if file exists
    let existingTranslations = {};
    if (fs.existsSync(targetFile)) {
      existingTranslations = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
    }

    log(`\n📝 Translating to ${targetLang}...`, colors.blue);

    const translated = {};
    let newTranslations = 0;
    let skipped = 0;

    for (const key of keys) {
      // Skip if already translated
      if (existingTranslations[key]) {
        translated[key] = existingTranslations[key];
        skipped++;
        continue;
      }

      // Translate
      const text = sourceTranslations[key];
      translated[key] = await translateText(text, targetLang);
      newTranslations++;

      // Small delay to avoid rate limiting
      if (apiKey && newTranslations % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Write to file
    fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2), 'utf-8');

    log(`   ✓ ${newTranslations} new translations`, colors.green);
    log(`   ✓ ${skipped} existing translations`, colors.green);
    log(`   ✓ Saved to: ${targetFile}`, colors.green);
  }

  log('\n✅ Translation complete!\n', colors.green);
  log(`Generated translations for ${targetLanguages.length} languages\n`);
})();
