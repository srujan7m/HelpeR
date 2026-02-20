#!/usr/bin/env node

/**
 * Lingo CLI - Extract Tool
 * Extracts translatable strings from source code
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load config
const configPath = path.join(process.cwd(), 'lingo.config.ts');
let config;

try {
  // For simplicity, we'll create a default config if file doesn't exist
  config = {
    sourceLocale: 'en',
    extract: {
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      patterns: ['t(', 'tv(', 'tp(', 'ts('],
    },
    output: {
      path: './locales',
      format: 'json',
    },
  };
} catch (error) {
  console.error('Error loading lingo.config.ts:', error.message);
  process.exit(1);
}

console.log('🔍 Extracting translatable strings...\n');

const translations = new Map();
let filesProcessed = 0;
let stringsFound = 0;

// Pattern to match translation function calls
// Matches: t('text'), t("text"), t(`text`)
const translationPattern = /\bt\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*['"`]([^'"`]*)['"`])?\s*\)/g;

// Process files
config.extract.include.forEach((pattern) => {
  const files = glob.sync(pattern, {
    ignore: ['node_modules/**', '.next/**', 'dist/**'],
  });

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    let match;

    while ((match = translationPattern.exec(content)) !== null) {
      const key = match[1];
      const fallback = match[2] || key;
      
      if (!translations.has(key)) {
        translations.set(key, fallback);
        stringsFound++;
      }
    }

    filesProcessed++;
  });
});

console.log(`✓ Processed ${filesProcessed} files`);
console.log(`✓ Found ${stringsFound} unique translatable strings\n`);

// Create output directory
const outputDir = path.join(process.cwd(), config.output.path);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write source locale file
const outputFile = path.join(outputDir, `${config.sourceLocale}.json`);
const translationObj = Object.fromEntries(translations);

fs.writeFileSync(outputFile, JSON.stringify(translationObj, null, 2), 'utf-8');

console.log(`✓ Extracted translations saved to: ${outputFile}`);
console.log(`\n✅ Extraction complete!\n`);
console.log(`Next steps:`);
console.log(`  1. Review ${outputFile}`);
console.log(`  2. Run: npm run i18n:translate\n`);

process.exit(0);
