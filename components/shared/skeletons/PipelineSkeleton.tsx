export default function PipelineSkeleton({
  columns = 5,
  cardsPerColumn = 3,
}: {
  columns?: number
  cardsPerColumn?: number
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div key={colIdx} className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-8 animate-pulse rounded bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            {Array.from({ length: cardsPerColumn }).map((__, cardIdx) => (
              <div
                key={cardIdx}
                className="rounded-lg border bg-card p-4"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

