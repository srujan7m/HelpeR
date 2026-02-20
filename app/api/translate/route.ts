import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getTranslationClient } from '@/lib/translationClient'
import { prisma } from '@/lib/prisma'
import { isValidLang } from '@/lib/i18n'

interface TranslateRequest {
  text: string;
  targetLang: string;
  sourceLang?: string;
}

const memoryTranslationCache = new Map<string, string>()
let hasLoggedCacheReadFailure = false
let hasLoggedCacheWriteFailure = false
let hasLoggedStatsFailure = false

function getCacheKey(text: string, sourceLang: string, targetLang: string) {
  return `${sourceLang}:${targetLang}:${text}`
}

/**
 * POST /api/translate
 * Translate text from one language to another
 * Includes caching in the database to avoid redundant API calls
 */
export async function POST(req: NextRequest) {
  try {
    const { text, targetLang, sourceLang = 'en' }: TranslateRequest = await req.json()

    // Validate input
    if (!text || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetLang' },
        { status: 400 }
      )
    }

    if (!isValidLang(targetLang) || !isValidLang(sourceLang)) {
      return NextResponse.json(
        { error: 'Invalid language code' },
        { status: 400 }
      )
    }

    // If same language, return original text
    if (sourceLang === targetLang) {
      return NextResponse.json({ translated: text })
    }

    const cacheKey = getCacheKey(text, sourceLang, targetLang)
    const memoryCached = memoryTranslationCache.get(cacheKey)
    if (memoryCached) {
      return NextResponse.json({ translated: memoryCached })
    }

    // Check translation cache in database first (best effort)
    try {
      const cached = await prisma.translationCache.findFirst({
        where: {
          sourceText: text,
          sourceLang,
          targetLang,
        },
      })

      if (cached) {
        memoryTranslationCache.set(cacheKey, cached.translatedText)
        return NextResponse.json({ translated: cached.translatedText })
      }
    } catch (error) {
      if (!hasLoggedCacheReadFailure) {
        hasLoggedCacheReadFailure = true
        console.warn('Translation cache read skipped (DB unavailable).')
      }
    }

    // Get translation from API
    const client = getTranslationClient()
    const translated = await client.translateText({
      text,
      source: sourceLang,
      target: targetLang,
    })

    memoryTranslationCache.set(cacheKey, translated)

    // Cache the translation in DB (best effort)
    try {
      await prisma.translationCache.create({
        data: {
          sourceText: text,
          sourceLang,
          targetLang,
          translatedText: translated,
        },
      })
    } catch (error) {
      if (!hasLoggedCacheWriteFailure) {
        hasLoggedCacheWriteFailure = true
        console.warn('Translation cache write skipped (DB unavailable).')
      }
    }

    return NextResponse.json({ translated })
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/translate
 * Get translation statistics (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const totalTranslations = await prisma.translationCache.count()
      const languages = await prisma.translationCache.groupBy({
        by: ['targetLang'],
        _count: true,
      })

      return NextResponse.json({
        totalTranslations,
        languages: languages.map(l => ({
          lang: l.targetLang,
          count: l._count,
        })),
      })
    } catch (error) {
      if (!hasLoggedStatsFailure) {
        hasLoggedStatsFailure = true
        console.warn('Translation stats fallback to memory cache (DB unavailable).')
      }
      return NextResponse.json({
        totalTranslations: memoryTranslationCache.size,
        languages: [],
      })
    }
  } catch (error) {
    console.error('Translation stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
