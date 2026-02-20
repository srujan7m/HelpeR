'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { popularLanguages, isValidLang } from '@/lib/i18n'
import { useUserLanguage } from '@/hooks/use-translation'
import { useUiTranslations } from '@/hooks/use-ui-translations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Languages, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

interface LanguageSwitcherProps {
  currentLang?: string
  className?: string
}

function normalizeLanguageCode(language: string): string {
  const [base, region] = language.split('-')
  if (!region) return base.toLowerCase()
  return `${base.toLowerCase()}-${region.toUpperCase()}`
}

export default function LanguageSwitcher({ currentLang, className }: LanguageSwitcherProps) {
  const router = useRouter()
  const { language, updateLanguage } = useUserLanguage()
  const activeLanguage = currentLang ?? language
  const [customLang, setCustomLang] = useState('')
  const [error, setError] = useState('')
  const { t } = useUiTranslations(
    'Popular Languages',
    'Custom Language Code',
    'Apply',
    'Supports all ISO 639-1 language codes (e.g., en, hi, de) and regional variants (e.g., en-US, zh-CN)',
    'Invalid language code. Use format: en, hi, es-MX, etc.',
    'Language updated successfully',
    'Failed to update language preference'
  )

  const changeLanguage = async (newLang: string) => {
    const normalizedLanguage = normalizeLanguageCode(newLang.trim())

    if (!isValidLang(normalizedLanguage)) {
      setError(t('Invalid language code. Use format: en, hi, es-MX, etc.'))
      return
    }

    setError('')
    const success = await updateLanguage(normalizedLanguage)
    if (success) {
      toast.success(t('Language updated successfully'))
      router.refresh()
      return
    }

    toast.error(t('Failed to update language preference'))
  }

  const handleCustomLanguage = async () => {
    if (!customLang.trim()) return
    await changeLanguage(customLang)
  }

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Languages className="h-4 w-4" />
            <span className="uppercase">{activeLanguage}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t('Popular Languages')}</h4>
              <div className="grid grid-cols-2 gap-2">
                {popularLanguages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={activeLanguage === lang.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeLanguage(lang.code)}
                    className="justify-start gap-2"
                  >
                    {activeLanguage === lang.code && <Check className="h-4 w-4" />}
                    <span>{lang.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">{t('Custom Language Code')}</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., de, pt-BR, zh-CN"
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomLanguage()
                    }
                  }}
                />
                <Button onClick={handleCustomLanguage} size="sm">
                  {t('Apply')}
                </Button>
              </div>
              {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              <p className="text-xs text-muted-foreground mt-2">
                {t('Supports all ISO 639-1 language codes (e.g., en, hi, de) and regional variants (e.g., en-US, zh-CN)')}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
