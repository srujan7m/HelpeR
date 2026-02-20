import { LucideIcon } from 'lucide-react'
import { useUiTranslations } from '@/hooks/use-ui-translations'

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
}

export function KPICard({ icon: Icon, label, value, change, trend }: KPICardProps) {
  const { t } = useUiTranslations(label, change ?? '')

  return (
    <div className="p-6 rounded-2xl border border-border bg-card hover:border-foreground/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{t(label)}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {t(change)}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-foreground" />
        </div>
      </div>
    </div>
  )
}
