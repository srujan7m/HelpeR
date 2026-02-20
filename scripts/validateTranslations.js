/**
 * Translation Validation Script
 * Validates that translation system is properly configured
 * Run this in CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');

// Color console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warn(message) {
  log(`⚠ ${message}`, colors.yellow);
}

let hasErrors = false;

// 1. Check environment variables
log('\nValidating Environment Variables...', colors.yellow);

if (!process.env.TRANSLATION_API_KEY) {
  warn('TRANSLATION_API_KEY not set (optional for development)');
} else {
  success('TRANSLATION_API_KEY is configured');
}

// 2. Check that i18n files exist
log('\nValidating i18n Files...', colors.yellow);

const requiredFiles = [
  'lib/i18n.ts',
  'lib/translationClient.ts',
  'lib/getDictionary.ts',
  'components/LanguageSwitcher.tsx',
  'app/api/translate/route.ts',
  'app/api/user/language/route.ts',
];

for (const file of requiredFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    success(`${file} exists`);
  } else {
    error(`${file} is missing`);
    hasErrors = true;
  }
}

// 3. Validate middleware.ts contains language detection
log('\nValidating Middleware...', colors.yellow);

const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  if (middlewareContent.includes('isValidLang') && middlewareContent.includes('getLanguageFromPathname')) {
    success('Middleware includes language detection');
  } else {
    error('Middleware missing language detection logic');
    hasErrors = true;
  }
} else {
  error('middleware.ts not found');
  hasErrors = true;
}

// 4. Validate Prisma schema
log('\nValidating Database Schema...', colors.yellow);

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  if (schemaContent.includes('model TranslationCache')) {
    success('TranslationCache model exists in schema');
  } else {
    error('TranslationCache model missing from schema');
    hasErrors = true;
  }
  
  if (schemaContent.match(/model User[\s\S]*language.*String/)) {
    success('User model has language field');
  } else {
    error('User model missing language field');
    hasErrors = true;
  }
} else {
  error('prisma/schema.prisma not found');
  hasErrors = true;
}

// 5. Check TypeScript compilation
log('\nValidating TypeScript...', colors.yellow);

try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  success('TypeScript compilation successful');
} catch (e) {
  error('TypeScript compilation failed');
  hasErrors = true;
}

// Summary
log('\n' + '='.repeat(50), colors.yellow);

if (hasErrors) {
  error('\nTranslation validation FAILED');
  process.exit(1);
} else {
  success('\nTranslation validation PASSED');
  log('\n✓ All translation system checks passed successfully!', colors.green);
  process.exit(0);
}
