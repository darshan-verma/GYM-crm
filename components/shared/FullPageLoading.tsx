import { Dumbbell, Loader2 } from "lucide-react"

/**
 * Full-page loading UI for root and auth routes.
 * Shown during initial load or when navigating to auth pages.
 */
export default function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex flex-col items-center gap-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  )
}
