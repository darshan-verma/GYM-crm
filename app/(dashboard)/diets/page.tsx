import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

export default function DietsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diet Plans</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage nutrition programs for your members
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
          <Link href="/diets/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Diet Plan
          </Link>
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Diet Plans Module</h3>
            <p className="text-muted-foreground mb-6">
              Create personalized nutrition plans with meal breakdowns, calorie tracking,
              and macro calculations. Help your members achieve their fitness goals.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
              <p>✓ Meal planning with multiple meals per day</p>
              <p>✓ Calorie and macro tracking (Protein, Carbs, Fats)</p>
              <p>✓ Food database and portion sizes</p>
              <p>✓ Goal-based nutrition (Weight Loss, Muscle Gain, Maintenance)</p>
              <p>✓ Custom recipes and meal templates</p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Full implementation coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
