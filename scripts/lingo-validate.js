#!/usr/bin/env node

/**
 * Lingo CLI - Validate Tool
 * Validates translation completeness and consistency
 */

const fs = require('fs');
const path = require('path');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

log('\n🔍 Validating translations...\n', colors.yellow);

const config = {
  sourceLocale: 'en',
  output: { path: './locales' },
  validation: {
    strictMode: true,
    minCoverage: 100,
  },
};

const localesDir = path.join(process.cwd(), config.output.path);
const sourceFile = path.join(localesDir, `${config.sourceLocale}.json`);

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  log('❌ Source translation file not found!', colors.red);
  log(`   Expected: ${sourceFile}`, colors.yellow);
  log('   Run: npm run i18n:extract\n', colors.yellow);
  process.exit(1);
}

// Load source translations
const sourceTranslations = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
const sourceKeys = Object.keys(sourceTranslations);

log(`✓ Source locale (${config.sourceLocale}): ${sourceKeys.length} keys`, colors.green);

// Find all translation files
const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'));
const targetFiles = files.filter((f) => f !== `${config.sourceLocale}.json`);

if (targetFiles.length === 0) {
  log('\n⚠️  No target language files found', colors.yellow);
  log('   Run: npm run i18n:translate\n', colors.yellow);
  process.exit(0);
}

log(`\nValidating ${targetFiles.length} target languages...\n`);

let hasErrors = false;
const results = [];

targetFiles.forEach((file) => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const translations = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const targetKeys = Object.keys(translations);

  // Find missing keys
  const missing = sourceKeys.filter((key) => !translations[key]);
  
  // Find extra keys (not in source)
  const extra = targetKeys.filter((key) => !sourceTranslations[key]);

  // Calculate coverage
  const coverage = ((targetKeys.length - missing.length) / sourceKeys.length) * 100;

  results.push({
    lang,
    total: sourceKeys.length,
    translated: targetKeys.length - missing.length,
    missing: missing.length,
    extra: extra.length,
    coverage: coverage.toFixed(1),
  });

  // Display results
  log(`[${lang}]`, colors.yellow);
  log(`  Translated: ${targetKeys.length - missing.length}/${sourceKeys.length}`, colors.green);
  log(`  Coverage: ${coverage.toFixed(1)}%`, coverage >= config.validation.minCoverage ? colors.green : colors.red);
  
  if (missing.length > 0) {
    log(`  ⚠️  Missing: ${missing.length} keys`, colors.yellow);
    if (config.validation.strictMode) {
      hasErrors = true;
    }
  }

  if (extra.length > 0) {
    log(`  ⚠️  Extra (unused): ${extra.length} keys`, colors.yellow);
  }

  log('');
});

// Summary
log('─'.repeat(50), colors.yellow);
log('\n📊 Validation Summary:\n', colors.yellow);

const avgCoverage =
  results.reduce((sum, r) => sum + parseFloat(r.coverage), 0) / results.length;

log(`Languages validated: ${results.length}`);
log(`Average coverage: ${avgCoverage.toFixed(1)}%`);
log(`Strict mode: ${config.validation.strictMode ? 'enabled' : 'disabled'}\n`);

if (hasErrors) {
  log('❌ Validation FAILED', colors.red);
  log('   Fix missing translations before building\n', colors.yellow);
  process.exit(1);
} else {
  log('✅ Validation PASSED\n', colors.green);
  process.exit(0);
}
