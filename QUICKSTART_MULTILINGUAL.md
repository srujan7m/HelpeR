# 🚀 Multilingual Quickstart - Compiler Architecture

## ⚡ 5-Minute Setup

### 1️⃣ Configure API Key

Add to `.env`:

```env
# Google Translate API (recommended)
LINGO_API_KEY=your_google_translate_api_key
```

**Get API Key**: https://cloud.google.com/translate/docs/setup

---

### 2️⃣ Extract Translatable Strings

```bash
npm run i18n:extract
```

**What it does:**
- Scans all `t()` function calls
- Generates `locales/en.json`

**Output:**
```
✓ Processed 43 files
✓ Found 156 unique translatable strings
✓ Extracted translations saved to: locales/en.json
```

---

### 3️⃣ Translate to Languages

```bash
npm run i18n:translate
```

**What it does:**
- Auto-translates `en.json` to all target languages
- Generates `locales/hi.json`, `locales/es.json`, etc.

**Output:**
```
📝 Translating to hi...
   ✓ 156 new translations
   ✓ Saved to: locales/hi.json

📝 Translating to es...
   ✓ 156 new translations
   ✓ Saved to: locales/es.json

✅ Translation complete!
Generated translations for 11 languages
```

---

### 4️⃣ Validate (Optional)

```bash
npm run i18n:validate
```

**What it does:**
- Checks translation completeness
- Reports coverage percentage
- Fails if < 100% (in strict mode)

**Output:**
```
[hi]
  Translated: 156/156
  Coverage: 100.0%

[es]
  Translated: 156/156
  Coverage: 100.0%

✅ Validation PASSED
```

---

### 5️⃣ Run Your App

```bash
npm run dev
```

Visit:
- `http://localhost:3000` → Redirects to `/en/`
- `http://localhost:3000/hi/` → Hindi version
- `http://localhost:3000/es/` → Spanish version

---

## 🎨 Usage Examples

### Example 1: Static UI Translation

**Component:**

```typescript
import { getDictionary, t } from '@/lib/getDictionary'

export default async function WelcomePage({ params }: { params: { lang: string } }) {
  const translations = await getDictionary(params.lang)
  
  return (
    <div>
      <h1>{t(translations, 'Welcome to HelpeR')}</h1>
      <p>{t(translations, 'AI-Powered Recruitment Platform')}</p>
      <button>{t(translations, 'Get Started')}</button>
    </div>
  )
}
```

**Auto-generated `locales/en.json`:**

```json
{
  "Welcome to HelpeR": "Welcome to HelpeR",
  "AI-Powered Recruitment Platform": "AI-Powered Recruitment Platform",
  "Get Started": "Get Started"
}
```

**Auto-translated `locales/hi.json`:**

```json
{
  "Welcome to HelpeR": "HelpeR में आपका स्वागत है",
  "AI-Powered Recruitment Platform": "एआई-संचालित भर्ती मंच",
  "Get Started": "शुरू करें"
}
```

---

### Example 2: Client Component with Provider

**Layout (Server Component):**

```typescript
import { TranslationProvider } from '@/lib/lingo/react'
import { getDictionary } from '@/lib/getDictionary'

export default async function Layout({ children, params }) {
  const translations = await getDictionary(params.lang)
  
  return (
    <TranslationProvider lang={params.lang} translations={translations}>
      {children}
    </TranslationProvider>
  )
}
```

**Child Component (Client):**

```typescript
'use client'

import { t } from '@/lib/lingo/react'

export function SignUpButton() {
  const handleClick = () => {
    console.log('Sign up clicked')
  }
  
  return (
    <button onClick={handleClick}>
      {t('Sign Up')}
    </button>
  )
}
```

**Result:**
- English: "Sign Up"
- Hindi: "साइन अप करें"
- Spanish: "Registrarse"
- French: "S'inscrire"

---

### Example 3: Dynamic Content Translation

**For database content (job descriptions, etc.):**

```typescript
'use client'

import { useState, useEffect } from 'react'

export function JobCard({ job, lang }: { job: Job; lang: string }) {
  const [translatedTitle, setTranslatedTitle] = useState(job.title)

  useEffect(() => {
    if (lang !== 'en') {
      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: job.title,
          targetLang: lang,
        }),
      })
        .then(res => res.json())
        .then(data => setTranslatedTitle(data.translated))
    }
  }, [job.title, lang])

  return <h2>{translatedTitle}</h2>
}
```

---

## 🔄 Workflow

### Daily Development

1. Write code with `t()` function
2. Test locally (English)
3. Commit code
4. **That's it!** CI handles extraction & translation

### Before Deployment

```bash
npm run i18n:sync    # Extract + Translate
npm run i18n:validate # Check completeness
npm run build         # Build with translations
```

---

## 📋 CLI Commands Cheat Sheet

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `npm run i18n:extract` | Extract `t()` calls → `en.json` | After adding new strings |
| `npm run i18n:translate` | Translate `en.json` → all languages | After extraction |
| `npm run i18n:validate` | Check translation coverage | Before deployment |
| `npm run i18n:sync` | Extract + Translate (one command) | Regular sync |

---

## 🌍 Supported Languages

**Default (auto-generated):**
- 🇬🇧 English (en)
- 🇮🇳 Hindi (hi)
- 🇪🇸 Spanish (es)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)
- 🇰🇷 Korean (ko)
- 🇸🇦 Arabic (ar)
- 🇵🇹 Portuguese (pt)
- 🇷🇺 Russian (ru)
- 🇮🇹 Italian (it)

**Custom languages:**

```bash
npm run i18n:translate -- --target=sv,no,da  # Swedish, Norwegian, Danish
```

**Unlimited!** Any ISO 639-1 language code.

---

## 🔧 Configuration

### Add More Languages

Edit `lingo.config.ts`:

```typescript
export default {
  // ...
  defaultLanguages: [
    'en', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ko',
    'sv', 'no', 'da',  // Add more here
  ],
}
```

Then run:

```bash
npm run i18n:translate
```

---

## 🐛 Common Issues

### Issue: "Translation API error"

**Solution:**
```bash
# Check API key
echo $LINGO_API_KEY

# If empty, add to .env
echo 'LINGO_API_KEY=your_key' >> .env
```

### Issue: "No translations found"

**Solution:**
```bash
# Extract strings first
npm run i18n:extract

# Then translate
npm run i18n:translate
```

### Issue: Translations not showing

**Check:**
1. Is `locales/en.json` present?
2. Did you run `npm run i18n:translate`?
3. Is the language route correct? (`/en/`, `/hi/`, etc.)

---

## 🎯 Next Steps

1. ✅ **Setup complete!** You can now use `t()` in your components
2. 📖 Read the [full guide](COMPILER_MULTILINGUAL_GUIDE.md) for advanced features
3. 🚀 Deploy with automated CI/CD translation validation

---

## ⚡ Production Deployment

```bash
# 1. Sync translations
npm run i18n:sync

# 2. Validate
npm run i18n:validate

# 3. Build (includes validation)
npm run build

# 4. Deploy
npm run start
```

**CI/CD** automatically:
- ✅ Extracts strings
- ✅ Validates completeness
- ✅ Fails build if missing translations
- ✅ Bundles translations with build

---

## 📚 Resources

- **Full Guide**: [COMPILER_MULTILINGUAL_GUIDE.md](COMPILER_MULTILINGUAL_GUIDE.md)
- **Example Code**: `app/[lang]/page.tsx`
- **CLI Scripts**: `scripts/lingo-*.js`
- **Configuration**: `lingo.config.ts`

---

**Ready to go global!** 🌍🚀

Start using `t('Your string here')` in your components and run `npm run i18n:sync`!
