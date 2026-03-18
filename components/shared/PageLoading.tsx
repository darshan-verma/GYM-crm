import { Loader2 } from "lucide-react"

/**
 * In-content loading UI for dashboard and other layout-based routes.
 * Shown in the main content area while the page segment loads.
 */
export default function PageLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-12">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      {/* Optional skeleton pulses for a polished feel */}
      <div className="mt-8 w-full max-w-2xl space-y-4 px-4">
        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
