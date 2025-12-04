import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Plans</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage workout programs for your members
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
          <Link href="/workouts/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Workout Plan
          </Link>
        </Button>
      </div>

      {/* Coming Soon Card */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Workout Plans Module</h3>
            <p className="text-muted-foreground mb-6">
              Create custom workout plans with exercises, sets, reps, and rest times.
              Assign plans to members and track their progress.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
              <p>✓ Exercise library with video tutorials</p>
              <p>✓ Custom workout builder</p>
              <p>✓ Progress tracking</p>
              <p>✓ Difficulty levels (Beginner, Intermediate, Advanced)</p>
              <p>✓ Goal-based programs (Weight Loss, Muscle Gain, Endurance)</p>
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
