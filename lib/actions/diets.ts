'use server'

import prisma from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getDietPlans(memberId?: string) {
  const where: any = {}
  
  if (memberId) {
    where.memberId = memberId
  }

  return await prisma.dietPlan.findMany({
    where,
    include: {
      member: {
        select: {
          id: true,
          name: true,
          membershipNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getDietPlan(id: string) {
  return await prisma.dietPlan.findUnique({
    where: { id },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          membershipNumber: true,
          email: true,
          phone: true,
        },
      },
    },
  })
}

export async function createDietPlan(data: {
  memberId: string
  name: string
  description?: string
  meals: any[]
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  dietType?: string
  startDate?: Date
  endDate?: Date
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    await prisma.dietPlan.create({
      data: {
        ...data,
        meals: data.meals,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_DIET_PLAN',
        entity: 'DIET_PLAN',
        entityId: data.memberId,
        details: `Created diet plan: ${data.name}`,
      },
    })

    revalidatePath('/diets')
    revalidatePath(`/members/${data.memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create diet plan' }
  }
}

export async function updateDietPlan(id: string, data: {
  name: string
  description?: string
  meals: any[]
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  dietType?: string
  startDate?: Date
  endDate?: Date
  active?: boolean
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const plan = await prisma.dietPlan.update({
      where: { id },
      data: {
        ...data,
        meals: data.meals,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_DIET_PLAN',
        entity: 'DIET_PLAN',
        entityId: plan.memberId,
        details: `Updated diet plan: ${data.name}`,
      },
    })

    revalidatePath('/diets')
    revalidatePath(`/diets/${id}`)
    revalidatePath(`/members/${plan.memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update diet plan' }
  }
}

export async function deleteDietPlan(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const plan = await prisma.dietPlan.delete({
      where: { id },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_DIET_PLAN',
        entity: 'DIET_PLAN',
        entityId: plan.memberId,
        details: `Deleted diet plan: ${plan.name}`,
      },
    })

    revalidatePath('/diets')
    revalidatePath(`/members/${plan.memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete diet plan' }
  }
}

// Food database
export const foodDatabase = [
  // Proteins
  { name: 'Chicken Breast (100g)', category: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Eggs (2 large)', category: 'Protein', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: 'Greek Yogurt (100g)', category: 'Protein', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: 'Salmon (100g)', category: 'Protein', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Tuna (100g)', category: 'Protein', calories: 132, protein: 28, carbs: 0, fat: 1.3 },
  { name: 'Tofu (100g)', category: 'Protein', calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { name: 'Paneer (100g)', category: 'Protein', calories: 265, protein: 18, carbs: 1.2, fat: 20 },
  
  // Carbs
  { name: 'Brown Rice (100g cooked)', category: 'Carbs', calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: 'White Rice (100g cooked)', category: 'Carbs', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Oats (100g)', category: 'Carbs', calories: 389, protein: 17, carbs: 66, fat: 6.9 },
  { name: 'Sweet Potato (100g)', category: 'Carbs', calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: 'Quinoa (100g cooked)', category: 'Carbs', calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: 'Whole Wheat Bread (1 slice)', category: 'Carbs', calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: 'Roti (1 medium)', category: 'Carbs', calories: 71, protein: 2.1, carbs: 15, fat: 0.4 },
  
  // Vegetables
  { name: 'Broccoli (100g)', category: 'Vegetables', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: 'Spinach (100g)', category: 'Vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: 'Carrots (100g)', category: 'Vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { name: 'Tomatoes (100g)', category: 'Vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Cucumber (100g)', category: 'Vegetables', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  
  // Fruits
  { name: 'Banana (1 medium)', category: 'Fruits', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Apple (1 medium)', category: 'Fruits', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Orange (1 medium)', category: 'Fruits', calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
  { name: 'Berries (100g)', category: 'Fruits', calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  
  // Fats
  { name: 'Almonds (28g)', category: 'Fats', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Peanut Butter (2 tbsp)', category: 'Fats', calories: 188, protein: 8, carbs: 7, fat: 16 },
  { name: 'Avocado (1/2 medium)', category: 'Fats', calories: 120, protein: 1.5, carbs: 6, fat: 11 },
  { name: 'Olive Oil (1 tbsp)', category: 'Fats', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: 'Ghee (1 tbsp)', category: 'Fats', calories: 112, protein: 0, carbs: 0, fat: 12.7 },
  
  // Snacks
  { name: 'Protein Shake', category: 'Snacks', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: 'Protein Bar', category: 'Snacks', calories: 200, protein: 20, carbs: 22, fat: 6 },
  { name: 'Boiled Chickpeas (100g)', category: 'Snacks', calories: 164, protein: 9, carbs: 27, fat: 2.6 },
]
