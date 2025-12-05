'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Plus, Trash2 } from 'lucide-react'
import { createWorkoutPlan } from '@/lib/actions/workouts'
import { exerciseLibrary } from '@/lib/data/exercise-library'

interface WorkoutFormProps {
  members: Array<{ id: string; name: string; membershipNumber: string }>
}

export function WorkoutForm({ members }: WorkoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    description: '',
    difficulty: 'BEGINNER',
    goal: 'WEIGHT_LOSS',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const [exercises, setExercises] = useState<Array<{
    name: string
    sets: number
    reps: number
    weight: number
    restTime: number
    notes: string
  }>>([{
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
    restTime: 60,
    notes: '',
  }])

  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio']

  const filteredExercises = selectedCategory === 'All' 
    ? exerciseLibrary 
    : exerciseLibrary.filter(ex => ex.category === selectedCategory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.memberId) {
      setError('Please select a member')
      setLoading(false)
      return
    }

    if (exercises.some(ex => !ex.name)) {
      setError('All exercises must have a name')
      setLoading(false)
      return
    }

    const result = await createWorkoutPlan({
      ...formData,
      exercises,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    })

    if (result?.success) {
      router.push('/workouts')
      router.refresh()
    } else {
      setError(result?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const addExercise = () => {
    setExercises([...exercises, {
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      notes: '',
    }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="memberId">Member *</Label>
          <Select 
            value={formData.memberId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} ({member.membershipNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Plan Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Upper Body Strength"
            required
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the workout plan"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select 
            value={formData.difficulty} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal">Fitness Goal</Label>
          <Select 
            value={formData.goal} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
              <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
              <SelectItem value="ENDURANCE">Endurance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Exercises</h3>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={addExercise} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <Label>Exercise Name *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={exercise.name}
                        onValueChange={(value) => updateExercise(index, 'name', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exercise" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredExercises.map((ex) => (
                            <SelectItem key={ex.name} value={ex.name}>
                              {ex.name} ({ex.equipment})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {exercises.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Sets</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Reps</Label>
                    <Input
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Rest Time (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={exercise.restTime}
                      onChange={(e) => updateExercise(index, 'restTime', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <Label>Notes</Label>
                    <Input
                      value={exercise.notes}
                      onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                      placeholder="Form tips, modifications, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Workout Plan'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/workouts')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
