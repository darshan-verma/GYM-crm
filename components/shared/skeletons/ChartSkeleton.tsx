export default function ChartSkeleton({
  height = 300,
}: {
  height?: number
}) {
  return (
    <div className="w-full rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="mt-4 w-full animate-pulse rounded-lg bg-muted" style={{ height }} />
    </div>
  )
}

