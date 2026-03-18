export default function TableSkeleton({
  rows = 10,
  cols = 6,
  showHeader = true,
}: {
  rows?: number
  cols?: number
  showHeader?: boolean
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-card">
      {showHeader ? (
        <div className="border-b bg-muted/30 p-4">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        </div>
      ) : null}

      <div className="p-4">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: cols }).map((__, c) => (
                <div
                  key={c}
                  className="h-4 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

