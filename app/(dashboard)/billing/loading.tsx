import { Card } from "@/components/ui/card"
import StatsCardSkeleton from "@/components/shared/skeletons/StatsCardSkeleton"
import TableSkeleton from "@/components/shared/skeletons/TableSkeleton"

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 animate-pulse rounded bg-muted" />
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <Card className="p-6">
        <StatsCardSkeleton count={3} />
      </Card>

      <TableSkeleton rows={10} cols={6} />
    </div>
  )
}

