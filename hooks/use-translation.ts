'use client'

import { useState, useEffect } from 'react'
import { defaultLang, isValidLang } from '@/lib/i18n'

interface UseTranslationOptions {
  text: string
  targetLang: string
  sourceLang?: string
  enabled?: boolean
}

const LANGUAGE_STORAGE_KEY = 'preferred-language'
let cachedLanguage: string | null = null
let pendingLanguageRequest: Promise<string | null> | null = null
const languageSubscribers = new Set<(language: string) => void>()

function normalizeLanguageCode(language: string): string {
  const [base, region] = language.split('-')
  if (!region) return base.toLowerCase()
  return `${base.toLowerCase()}-${region.toUpperCase()}`
}

function getStoredLanguage(): string | null {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (!value) return null
  const normalized = normalizeLanguageCode(value)
  return isValidLang(normalized) ? normalized : null
}

function persistLanguage(language: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  document.cookie = `preferred-language=${language};path=/;max-age=31536000;samesite=lax`
}

function notifyLanguageSubscribers(language: string) {
  for (const listener of languageSubscribers) {
    listener(language)
  }
}

async function fetchLanguagePreference(): Promise<string | null> {
  try {
    const response = await fetch('/api/user/language', { cache: 'no-store' })
    if (!response.ok) return null
    const data = await response.json()
    const normalized = normalizeLanguageCode(data.language ?? defaultLang)
    return isValidLang(normalized) ? normalized : defaultLang
  } catch (error) {
    console.error('Failed to fetch user language:', error)
    return null
  }
}

/**
 * Custom hook for client-side translation
 * Automatically translates text when language changes
 */
export function useTranslation({
  text,
  targetLang,
  sourceLang = 'en',
  enabled = true,
}: UseTranslationOptions) {
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip if disabled or same language
    if (!enabled || sourceLang === targetLang) {
      setTranslatedText(text)
      return
    }

    const translate = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLang,
            sourceLang,
          }),
        })

        if (!response.ok) {
          throw new Error('Translation failed')
        }

        const data = await response.json()
        setTranslatedText(data.translated)
      } catch (err) {
        console.error('Translation error:', err)
        setError('Translation failed')
        setTranslatedText(text) // Fallback to original text
      } finally {
        setIsLoading(false)
      }
    }

    translate()
  }, [text, targetLang, sourceLang, enabled])

  return { translatedText, isLoading, error }
}

/**
 * Hook to get user's preferred language
 */
export function useUserLanguage() {
  const [language, setLanguage] = useState<string>(() => {
    return cachedLanguage ?? getStoredLanguage() ?? defaultLang
  })
  const [isLoading, setIsLoading] = useState(() => cachedLanguage === null)

  useEffect(() => {
    const onLanguageChange = (nextLanguage: string) => {
      setLanguage(nextLanguage)
    }

    languageSubscribers.add(onLanguageChange)

    const initialize = async () => {
      const storedLanguage = cachedLanguage ?? getStoredLanguage()
      if (storedLanguage) {
        cachedLanguage = storedLanguage
        setLanguage(storedLanguage)
      }

      if (!pendingLanguageRequest) {
        pendingLanguageRequest = fetchLanguagePreference()
          .then((result) => {
            const resolved =
              result ?? cachedLanguage ?? getStoredLanguage() ?? defaultLang
            cachedLanguage = resolved
            persistLanguage(resolved)
            notifyLanguageSubscribers(resolved)
            return resolved
          })
          .finally(() => {
            pendingLanguageRequest = null
          })
      }

      await pendingLanguageRequest
      setIsLoading(false)
    }

    initialize()

    return () => {
      languageSubscribers.delete(onLanguageChange)
    }
  }, [])

  const updateLanguage = async (newLanguage: string) => {
    const normalizedLanguage = normalizeLanguageCode(newLanguage)
    if (!isValidLang(normalizedLanguage)) {
      return false
    }

    const previousLanguage = cachedLanguage ?? language ?? defaultLang
    cachedLanguage = normalizedLanguage
    persistLanguage(normalizedLanguage)
    notifyLanguageSubscribers(normalizedLanguage)

    try {
      const response = await fetch('/api/user/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: normalizedLanguage }),
      })

      if (!response.ok && response.status !== 401) {
        throw new Error('Failed to update language preference')
      }

      return true
    } catch (error) {
      console.error('Failed to update language:', error)
      cachedLanguage = previousLanguage
      persistLanguage(previousLanguage)
      notifyLanguageSubscribers(previousLanguage)
      return false
    }
  }

  return { language, isLoading, updateLanguage }
}

/**
 * Example usage:
 *
 * const { translatedText, isLoading } = useTranslation({
 *   text: job.description,
 *   targetLang: currentLang,
 * })
 *
 * return <p>{isLoading ? 'Translating...' : translatedText}</p>
 */
