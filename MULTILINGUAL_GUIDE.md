# 🌍 Multilingual Support Implementation Guide

## Overview

HelpeR now supports **unlimited languages** with automatic detection, persistent preferences, and translation caching. The system is built to scale globally without language restrictions.

---

## 🏗️ Architecture

### Language Detection Flow
```
User visits site
       ↓
Middleware detects browser language
       ↓
Redirect to /{lang}/...
       ↓
Static UI → getDictionary()
       ↓
Dynamic content → /api/translate
       ↓
Check DB cache
       ↓
If not cached → Translation API
       ↓
Store in cache
       ↓
Return to frontend
```

---

## 📁 Project Structure

```
/app
  /[lang]                           # Language-prefixed routes
    layout.tsx                      # Root layout with language support
    page.tsx                        # Home page example
    /dashboard
      page.tsx                      # Dashboard example
  /api
    /translate
      route.ts                      # Translation API endpoint
    /user
      /language
        route.ts                    # User language preference endpoint

/components
  LanguageSwitcher.tsx              # Language selector component

/lib
  i18n.ts                           # i18n configuration
  translationClient.ts              # Translation service client
  getDictionary.ts                  # Dictionary loader for static UI

/scripts
  validateTranslations.js           # CI/CD validation script

/prisma
  schema.prisma                     # Database schema with language fields

/middleware.ts                      # Language detection middleware
```

---

## 🚀 Quick Start

### 1. Environment Variables

Add to your `.env` file:

```env
# Translation API (optional - configure with your provider)
TRANSLATION_API_KEY=your_api_key_here

# Example for Google Translate API
# GOOGLE_TRANSLATE_API_KEY=your_key

# Example for DeepL
# DEEPL_API_KEY=your_key
```

### 2. Database Migration

Run the migration to add language support:

```bash
pnpm prisma migrate dev --name add_multilingual_support
```

This adds:
- `language` field to `User` table
- `TranslationCache` table for caching translations

### 3. Configure Translation Provider

Edit `lib/translationClient.ts` and implement your translation API:

```typescript
// Example with Google Translate API
async translateText(options: TranslateOptions): Promise<string> {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: options.text,
        source: options.source,
        target: options.target,
      }),
    }
  );
  const data = await response.json();
  return data.data.translations[0].translatedText;
}
```

---

## 📝 Usage Examples

### Static UI Translation

For hardcoded UI strings:

```typescript
import { getDictionary, t } from '@/lib/getDictionary'

export default async function MyPage({ params }: { params: { lang: string } }) {
  const { lang } = params
  const dict = await getDictionary(lang)

  return (
    <div>
      <h1>{t(dict, 'page.title', 'Welcome to HelpeR')}</h1>
      <p>{t(dict, 'page.description', 'AI-powered recruitment')}</p>
    </div>
  )
}
```

### Dynamic Content Translation

For content from the database:

```typescript
'use client'

import { useState, useEffect } from 'react'

export function JobListing({ job, lang }: { job: Job; lang: string }) {
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

### Server-Side Dynamic Translation

```typescript
async function translateContent(text: string, targetLang: string) {
  if (targetLang === 'en') return text

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang }),
    cache: 'force-cache', // Cache the translation
  })

  const data = await res.json()
  return data.translated
}
```

---

## 🔧 Components

### LanguageSwitcher

Add to your layouts:

```typescript
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Header({ lang }: { lang: string }) {
  return (
    <header>
      <LanguageSwitcher currentLang={lang} />
    </header>
  )
}
```

Features:
- Popular languages dropdown
- Custom language code input
- Automatic preference saving
- URL navigation

---

## 🗃️ Database

### User Language Preference

```typescript
// Update user language
await prisma.user.update({
  where: { id: userId },
  data: { language: 'hi' },
})

// Get user language
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { language: true },
})
```

### Translation Cache

Automatically managed by `/api/translate` endpoint. Manual queries:

```typescript
// Check cache
const cached = await prisma.translationCache.findFirst({
  where: {
    sourceText: 'Hello',
    sourceLang: 'en',
    targetLang: 'hi',
  },
})

// Clear old cache (optional - run periodically)
await prisma.translationCache.deleteMany({
  where: {
    createdAt: {
      lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days old
    },
  },
})
```

---

## 🛣️ Routing

### URL Structure

All routes are prefixed with language code:

```
/en/dashboard
/hi/dashboard
/es/dashboard
/fr/dashboard
/de/dashboard
/zh-CN/dashboard  # Regional variants supported
```

### Navigation

Always include language in links:

```typescript
import Link from 'next/link'

export function Navigation({ lang }: { lang: string }) {
  return (
    <nav>
      <Link href={`/${lang}/dashboard`}>Dashboard</Link>
      <Link href={`/${lang}/jobs`}>Jobs</Link>
      <Link href={`/${lang}/meetings`}>Meetings</Link>
    </nav>
  )
}
```

### Redirects

Use the `useRouter` or `redirect`:

```typescript
'use client'

import { useRouter } from 'next/navigation'

export function RedirectButton({ lang }: { lang: string }) {
  const router = useRouter()

  return (
    <button onClick={() => router.push(`/${lang}/dashboard`)}>
      Go to Dashboard
    </button>
  )
}
```

---

## 🧪 Testing & Validation

### Run Validation

```bash
pnpm validate:translations
```

This checks:
- ✓ All i18n files exist
- ✓ Middleware has language detection
- ✓ Database schema includes language fields
- ✓ TypeScript compilation

### Manual Testing

1. Visit `http://localhost:3000` - Should redirect to `/en/`
2. Change language in switcher - URL should update
3. Refresh page - Language should persist
4. Test with different browser languages
5. Test custom language codes (e.g., `pt-BR`, `zh-CN`)

---

## 📊 Supported Languages

**Any valid ISO 639-1 language code**, including:

- `en` - English
- `hi` - Hindi
- `es` - Spanish
- `fr` - French
- `de` - German
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `ar` - Arabic
- `ru` - Russian
- `pt` - Portuguese
- `it` - Italian
- Regional variants: `en-US`, `en-GB`, `zh-CN`, `zh-TW`, `pt-BR`, etc.

---

## 🔄 Migration Guide

### Migrating Existing Pages

1. **Move page files** to `app/[lang]/` structure:
   ```
   app/dashboard/page.tsx → app/[lang]/dashboard/page.tsx
   ```

2. **Update page props** to accept `lang` parameter:
   ```typescript
   interface PageProps {
     params: { lang: string }
   }
   
   export default function Page({ params }: PageProps) {
     const { lang } = params
     // ...
   }
   ```

3. **Add dictionary loading**:
   ```typescript
   const dict = await getDictionary(lang)
   ```

4. **Replace hardcoded strings**:
   ```typescript
   // Before
   <h1>Dashboard</h1>
   
   // After
   <h1>{t(dict, 'dashboard.title', 'Dashboard')}</h1>
   ```

5. **Update navigation links**:
   ```typescript
   // Before
   <Link href="/dashboard">Dashboard</Link>
   
   // After
   <Link href={`/${lang}/dashboard`}>Dashboard</Link>
   ```

### Migrating API Routes

API routes don't need language prefixes, but should support translation:

```typescript
// app/api/jobs/route.ts
export async function GET(req: NextRequest) {
  const lang = req.headers.get('accept-language')?.substring(0, 2) || 'en'
  
  const jobs = await prisma.job.findMany()
  
  // Optionally translate job titles/descriptions
  if (lang !== 'en') {
    for (const job of jobs) {
      job.title = await translateText(job.title, lang)
    }
  }
  
  return NextResponse.json(jobs)
}
```

---

## ⚡ Performance Optimization

### 1. Translation Caching

Translations are automatically cached in the database. For additional speed:

```typescript
// lib/translationClient.ts
import { cache } from 'react'

export const getCachedTranslation = cache(async (text: string, lang: string) => {
  // React's cache will dedupe requests during a single render
  return await translateText(text, lang)
})
```

### 2. Static Generation

Pre-generate pages for popular languages:

```typescript
// app/[lang]/page.tsx
export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'hi' },
    { lang: 'es' },
    { lang: 'fr' },
    { lang: 'de' },
  ]
}
```

### 3. Redis Caching (Optional)

For high-traffic sites, use Redis:

```typescript
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function translateWithRedis(text: string, targetLang: string) {
  const cacheKey = `translate:${targetLang}:${text}`
  
  const cached = await redis.get(cacheKey)
  if (cached) return cached
  
  const translated = await translateText(text, targetLang)
  await redis.set(cacheKey, translated, 'EX', 86400) // 24 hours
  
  return translated
}
```

---

## 🐛 Troubleshooting

### Language Not Detected

Check middleware config in `next.config.mjs`:

```javascript
// next.config.mjs
export default {
  // ... other config
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ]
  },
}
```

### Translations Not Working

1. Check API key is set: `process.env.TRANSLATION_API_KEY`
2. Check translation client implementation in `lib/translationClient.ts`
3. Check network requests in browser dev tools
4. Check database for cached translations

### Build Errors

Run validation:

```bash
pnpm validate:translations
pnpm tsc --noEmit
```

---

## 🚀 Production Deployment

### Environment Variables

Ensure these are set in production:

```env
DATABASE_URL=your_production_db
TRANSLATION_API_KEY=your_api_key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Database Migration

```bash
pnpm prisma migrate deploy
```

### Build

```bash
pnpm build
```

The CI/CD pipeline will automatically validate translations before deployment.

---

## 📚 Additional Resources

- [Next.js i18n Documentation](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Google Translate API](https://cloud.google.com/translate/docs)
- [DeepL API](https://www.deepl.com/docs-api)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

## 🎯 Next Steps

1. ✅ Configure translation API provider
2. ✅ Run database migration
3. ✅ Migrate existing pages to `[lang]` structure
4. ✅ Add language switcher to layouts
5. ✅ Test with multiple languages
6. ✅ Deploy to production

---

**Questions or issues?** Check the troubleshooting section or review the example files in `app/[lang]/`.
