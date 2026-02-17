export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="space-y-4 p-6">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
            <div className="w-20 h-6 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-border bg-card animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
