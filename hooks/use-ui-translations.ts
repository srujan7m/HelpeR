'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaultLang } from '@/lib/i18n'
import { useUserLanguage } from '@/hooks/use-translation'

const TEXT_SEPARATOR = '\u0001'
const translationCache = new Map<string, string>()
const translationRequests = new Map<string, Promise<string>>()

function getCacheKey(text: string, targetLang: string, sourceLang = 'en') {
  return `${sourceLang}:${targetLang}:${text}`
}

async function translateText(
  text: string,
  targetLang: string,
  sourceLang = 'en'
): Promise<string> {
  if (!text || targetLang === sourceLang) {
    return text
  }

  const cacheKey = getCacheKey(text, targetLang, sourceLang)
  const cached = translationCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const inFlight = translationRequests.get(cacheKey)
  if (inFlight) {
    return inFlight
  }

  const request = fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, targetLang, sourceLang }),
  })
    .then(async (response) => {
      if (!response.ok) return text
      const data = await response.json()
      const translated = typeof data.translated === 'string' ? data.translated : text
      translationCache.set(cacheKey, translated)
      return translated
    })
    .catch(() => text)
    .finally(() => {
      translationRequests.delete(cacheKey)
    })

  translationRequests.set(cacheKey, request)
  return request
}

/**
 * Runtime translation hook for static UI strings.
 * Pass all strings used in the component and call `t('Original Text')`.
 */
export function useUiTranslations(...texts: string[]) {
  const { language } = useUserLanguage()
  const targetLang = language ?? defaultLang
  const signature = texts.filter(Boolean).join(TEXT_SEPARATOR)

  const uniqueTexts = useMemo(() => {
    if (!signature) return [] as string[]
    return Array.from(new Set(signature.split(TEXT_SEPARATOR).filter(Boolean)))
  }, [signature])

  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!uniqueTexts.length || targetLang === defaultLang) {
      setTranslations({})
      setIsLoading(false)
      return
    }

    let active = true
    setIsLoading(true)

    const run = async () => {
      const entries = await Promise.all(
        uniqueTexts.map(async (text) => {
          const translated = await translateText(text, targetLang)
          return [text, translated] as const
        })
      )

      if (!active) return
      setTranslations(Object.fromEntries(entries))
      setIsLoading(false)
    }

    run()

    return () => {
      active = false
    }
  }, [targetLang, signature, uniqueTexts])

  const t = useCallback(
    (text: string, fallback?: string) => {
      if (!text) return fallback ?? ''
      if (targetLang === defaultLang) return text

      return (
        translations[text] ??
        translationCache.get(getCacheKey(text, targetLang)) ??
        fallback ??
        text
      )
    },
    [targetLang, translations]
  )

  return { t, language: targetLang, isLoading }
}
