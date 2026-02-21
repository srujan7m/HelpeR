import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { defaultLang, isValidLang } from '@/lib/i18n'

let hasLoggedLanguageWriteFailure = false
let hasLoggedLanguageReadFailure = false

function normalizeLanguageCode(language: string): string {
  const [base, region] = language.split('-')
  if (!region) return base.toLowerCase()
  return `${base.toLowerCase()}-${region.toUpperCase()}`
}

function getPreferredLanguageFromRequest(req: NextRequest): string {
  const cookieLanguage = req.cookies.get('preferred-language')?.value
  if (cookieLanguage && isValidLang(cookieLanguage)) {
    return normalizeLanguageCode(cookieLanguage)
  }

  const acceptLanguage = req.headers.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map((entry) => entry.split(';')[0]?.trim())
      .filter(Boolean) as string[]

    for (const language of languages) {
      const [base, region] = language.split('-')
      const normalized = region
        ? `${base.toLowerCase()}-${region.toUpperCase()}`
        : base.toLowerCase()

      if (isValidLang(normalized)) {
        return normalized
      }
    }
  }

  return defaultLang
}

/**
 * PATCH /api/user/language
 * Update user's preferred language
 */
export async function PATCH(req: NextRequest) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { language } = await req.json()
  const normalizedLanguage =
    typeof language === 'string' ? normalizeLanguageCode(language) : ''

  if (!normalizedLanguage || !isValidLang(normalizedLanguage)) {
    return NextResponse.json(
      { error: 'Invalid language code' },
      { status: 400 }
    )
  }

  const response = NextResponse.json({
    success: true,
    language: normalizedLanguage,
  })
  response.cookies.set('preferred-language', normalizedLanguage, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const claims = sessionClaims as Record<string, unknown> | null | undefined
  const claimEmail = typeof claims?.email === 'string' && claims.email
    ? claims.email
    : null
  const email = claimEmail ?? `${userId}@clerk.local`

  try {
    const existingByClerkId = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })

    if (existingByClerkId) {
      await prisma.user.update({
        where: { clerkId: userId },
        data: { language: normalizedLanguage },
      })
    } else {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (existingByEmail) {
        await prisma.user.update({
          where: { email },
          data: {
            clerkId: userId,
            language: normalizedLanguage,
          },
        })
      } else {
        await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            language: normalizedLanguage,
          },
        })
      }
    }
  } catch (error) {
    if (!hasLoggedLanguageWriteFailure) {
      hasLoggedLanguageWriteFailure = true
      console.warn('Language preference DB sync skipped (DB unavailable).')
    }
  }

  return response
}

/**
 * GET /api/user/language
 * Get user's preferred language
 */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  const fallbackLanguage = getPreferredLanguageFromRequest(req)

  if (!userId) {
    return NextResponse.json({ language: fallbackLanguage })
  }

  let language = fallbackLanguage
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { language: true },
    })
    language = user?.language ?? fallbackLanguage
  } catch (error) {
    if (!hasLoggedLanguageReadFailure) {
      hasLoggedLanguageReadFailure = true
      console.warn('Language preference DB read skipped (DB unavailable).')
    }
  }

  const response = NextResponse.json({ language })
  response.cookies.set('preferred-language', language, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  return response
}
