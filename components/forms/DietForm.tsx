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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createDietPlan, foodDatabase } from '@/lib/actions/diets'
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'

interface Member {
  id: string
  name: string
  email: string
}

interface FoodItem {
  foodName: string
  portion: number
  unit: string
}

interface Meal {
  mealName: string
  foods: FoodItem[]
}

export default function DietForm({ members }: { members: Member[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    description: '',
    dietType: '',
    calorieTarget: 0,
    proteinTarget: 0,
    carbTarget: 0,
    fatTarget: 0,
    startDate: '',
    endDate: '',
  })

  const [meals, setMeals] = useState<Meal[]>([
    { mealName: 'Breakfast', foods: [] },
  ])

  const categories = ['ALL', 'PROTEIN', 'CARBS', 'VEGETABLES', 'FRUITS', 'FATS', 'SNACKS']

  const filteredFoods = selectedCategory === 'ALL'
    ? foodDatabase
    : foodDatabase.filter(food => food.category === selectedCategory)

  const addMeal = () => {
    setMeals([...meals, { mealName: '', foods: [] }])
  }

  const removeMeal = (mealIndex: number) => {
    setMeals(meals.filter((_, i) => i !== mealIndex))
  }

  const updateMeal = (mealIndex: number, field: keyof Meal, value: any) => {
    const updated = [...meals]
    updated[mealIndex] = { ...updated[mealIndex], [field]: value }
    setMeals(updated)
  }

  const addFoodToMeal = (mealIndex: number, foodName: string) => {
    const updated = [...meals]
    updated[mealIndex].foods.push({ foodName, portion: 1, unit: 'serving' })
    setMeals(updated)
  }

  const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
    const updated = [...meals]
    updated[mealIndex].foods = updated[mealIndex].foods.filter((_, i) => i !== foodIndex)
    setMeals(updated)
  }

  const updateFood = (mealIndex: number, foodIndex: number, field: keyof FoodItem, value: any) => {
    const updated = [...meals]
    updated[mealIndex].foods[foodIndex] = {
      ...updated[mealIndex].foods[foodIndex],
      [field]: value,
    }
    setMeals(updated)
  }

  const calculateMacros = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    meals.forEach(meal => {
      meal.foods.forEach(foodItem => {
        const food = foodDatabase.find(f => f.name === foodItem.foodName)
        if (food) {
          const portion = foodItem.portion || 1
          totalCalories += food.calories * portion
          totalProtein += food.protein * portion
          totalCarbs += food.carbs * portion
          totalFat += food.fat * portion
        }
      })
    })

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
    }
  }

  const macros = calculateMacros()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.memberId) {
        toast.error('Please select a member')
        return
      }

      if (!formData.name.trim()) {
        toast.error('Please enter a diet plan name')
        return
      }

      if (meals.length === 0 || meals.every(m => m.foods.length === 0)) {
        toast.error('Please add at least one meal with foods')
        return
      }

      const result = await createDietPlan({
        ...formData,
        meals,
      })

      if (result.success) {
        toast.success('Diet plan created successfully')
        router.push('/diets')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to create diet plan')
      }
    } catch (error) {
      console.error('Error creating diet plan:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memberId">Member *</Label>
            <Select
              value={formData.memberId}
              onValueChange={(value) =>
                setFormData({ ...formData, memberId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} ({member.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Diet Plan Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., High Protein Weight Loss Plan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the diet plan goals and approach..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dietType">Diet Type</Label>
              <Select
                value={formData.dietType}
                onValueChange={(value) =>
                  setFormData({ ...formData, dietType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
                  <SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="KETO">Keto</SelectItem>
                  <SelectItem value="VEGETARIAN">Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="calorieTarget">Daily Calorie Target</Label>
              <Input
                id="calorieTarget"
                type="number"
                value={formData.calorieTarget || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calorieTarget: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 2000"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="proteinTarget">Protein Target (g)</Label>
              <Input
                id="proteinTarget"
                type="number"
                value={formData.proteinTarget || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proteinTarget: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbTarget">Carbs Target (g)</Label>
              <Input
                id="carbTarget"
                type="number"
                value={formData.carbTarget || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    carbTarget: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatTarget">Fat Target (g)</Label>
              <Input
                id="fatTarget"
                type="number"
                value={formData.fatTarget || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fatTarget: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 60"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Meal Plan</CardTitle>
            <Button type="button" onClick={addMeal} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {meals.map((meal, mealIndex) => (
            <div key={mealIndex} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Meal Name</Label>
                      <Input
                        value={meal.mealName}
                        onChange={(e) =>
                          updateMeal(mealIndex, 'mealName', e.target.value)
                        }
                        placeholder="e.g., Breakfast, Lunch, Snack"
                      />
                    </div>
                    {meals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeal(mealIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {meal.foods.map((food, foodIndex) => {
                      const foodItem = foodDatabase.find(f => f.name === food.foodName)
                      return (
                        <div key={foodIndex} className="flex gap-2 items-end bg-gray-50 p-3 rounded">
                          <div className="flex-1">
                            <Label className="text-xs">Food</Label>
                            <div className="text-sm font-medium">{food.foodName}</div>
                            {foodItem && (
                              <div className="text-xs text-gray-600">
                                {foodItem.calories} cal | P: {foodItem.protein}g | C: {foodItem.carbs}g | F: {foodItem.fat}g
                              </div>
                            )}
                          </div>
                          <div className="w-24">
                            <Label className="text-xs">Portion</Label>
                            <Input
                              type="number"
                              value={food.portion}
                              onChange={(e) =>
                                updateFood(mealIndex, foodIndex, 'portion', parseFloat(e.target.value) || 1)
                              }
                              step="0.5"
                              min="0.5"
                            />
                          </div>
                          <div className="w-28">
                            <Label className="text-xs">Unit</Label>
                            <Select
                              value={food.unit}
                              onValueChange={(value) =>
                                updateFood(mealIndex, foodIndex, 'unit', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="serving">serving</SelectItem>
                                <SelectItem value="grams">grams</SelectItem>
                                <SelectItem value="cup">cup</SelectItem>
                                <SelectItem value="piece">piece</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFoodFromMeal(mealIndex, foodIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t pt-3">
                    <Label className="mb-2 block">Add Food to Meal</Label>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {categories.map(cat => (
                        <Button
                          key={cat}
                          type="button"
                          size="sm"
                          variant={selectedCategory === cat ? "default" : "outline"}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {filteredFoods.map((food) => (
                        <Button
                          key={food.name}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="justify-start text-left h-auto py-2"
                          onClick={() => addFoodToMeal(mealIndex, food.name)}
                        >
                          <div>
                            <div className="font-medium text-sm">{food.name}</div>
                            <div className="text-xs text-gray-600">
                              {food.calories} cal
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {meals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No meals added yet. Click "Add Meal" to start.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Calculated Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{macros.calories}</div>
              <div className="text-sm text-blue-700">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{macros.protein}g</div>
              <div className="text-sm text-purple-700">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{macros.carbs}g</div>
              <div className="text-sm text-orange-700">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-900">{macros.fat}g</div>
              <div className="text-sm text-yellow-700">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Diet Plan'}
        </Button>
      </div>
    </form>
  )
}
