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
