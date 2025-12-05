import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDietPlan, foodDatabase } from '@/lib/actions/diets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Target,
  UtensilsCrossed,
  User,
  Flame,
  Edit,
} from 'lucide-react'

export default async function DietDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const plan = await getDietPlan(params.id)
  if (!plan) {
    notFound()
  }

  const getDietTypeColor = (type: string | null) => {
    switch (type) {
      case 'WEIGHT_LOSS':
        return 'bg-blue-100 text-blue-800'
      case 'MUSCLE_GAIN':
        return 'bg-purple-100 text-purple-800'
      case 'MAINTENANCE':
        return 'bg-green-100 text-green-800'
      case 'KETO':
        return 'bg-orange-100 text-orange-800'
      case 'VEGETARIAN':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateMealMacros = (meal: any) => {
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0

    meal.foods?.forEach((foodItem: any) => {
      const food = foodDatabase.find((f) => f.name === foodItem.foodName)
      if (food) {
        const portion = foodItem.portion || 1
        calories += food.calories * portion
        protein += food.protein * portion
        carbs += food.carbs * portion
        fat += food.fat * portion
      }
    })

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    }
  }

  const meals = (plan.meals as any[]) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/diets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Link
                href={`/members/${plan.member.id}`}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <User className="h-4 w-4" />
                <span>{plan.member.name}</span>
              </Link>
              {!plan.active && (
                <Badge variant="outline" className="bg-gray-100">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Link href={`/diets/${plan.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
        </Link>
      </div>

      {plan.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700">{plan.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Daily Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">
                {plan.calorieTarget || 'N/A'}
              </span>
              {plan.calorieTarget && <span className="text-gray-600">kcal</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Protein Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">
                {plan.proteinTarget || 'N/A'}
              </span>
              {plan.proteinTarget && <span className="text-gray-600">g</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Carbs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">
                {plan.carbTarget || 'N/A'}
              </span>
              {plan.carbTarget && <span className="text-gray-600">g</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Fat Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">
                {plan.fatTarget || 'N/A'}
              </span>
              {plan.fatTarget && <span className="text-gray-600">g</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {meals.length > 0 ? (
              meals.map((meal: any, index: number) => {
                const macros = calculateMealMacros(meal)
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{meal.mealName}</h3>
                      <div className="flex gap-2 text-sm">
                        <Badge variant="outline">{macros.calories} kcal</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="font-semibold text-purple-700">
                          {macros.protein}g
                        </div>
                        <div className="text-gray-600">Protein</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-700">
                          {macros.carbs}g
                        </div>
                        <div className="text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-semibold text-yellow-700">
                          {macros.fat}g
                        </div>
                        <div className="text-gray-600">Fats</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {meal.foods?.map((food: any, foodIndex: number) => {
                        const foodItem = foodDatabase.find(
                          (f) => f.name === food.foodName
                        )
                        return (
                          <div
                            key={foodIndex}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <div className="font-medium">{food.foodName}</div>
                              {foodItem && (
                                <div className="text-xs text-gray-600">
                                  {foodItem.calories * (food.portion || 1)} cal |
                                  P: {Math.round(foodItem.protein * (food.portion || 1))}g |
                                  C: {Math.round(foodItem.carbs * (food.portion || 1))}g |
                                  F: {Math.round(foodItem.fat * (food.portion || 1))}g
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {food.portion} {food.unit}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No meals added yet</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.dietType && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Diet Type</div>
                  <Badge className={getDietTypeColor(plan.dietType)}>
                    {plan.dietType.replace('_', ' ')}
                  </Badge>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(plan.startDate).toLocaleDateString()}
                    {plan.endDate &&
                      ` - ${new Date(plan.endDate).toLocaleDateString()}`}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Total Meals</div>
                <div className="flex items-center gap-2 text-sm">
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>{meals.length} meals per day</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <Badge variant={plan.active ? 'default' : 'secondary'}>
                  {plan.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Member Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Name</div>
                <Link
                  href={`/members/${plan.member.id}`}
                  className="font-medium hover:text-blue-600"
                >
                  {plan.member.name}
                </Link>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="text-sm">{plan.member.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="text-sm">{plan.member.phone || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
