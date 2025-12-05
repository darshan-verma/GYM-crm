'use server'

import prisma from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getWorkoutPlans(memberId?: string) {
  const where: any = {}
  
  if (memberId) {
    where.memberId = memberId
  }

  return await prisma.workoutPlan.findMany({
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

export async function getWorkoutPlan(id: string) {
  return await prisma.workoutPlan.findUnique({
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

export async function createWorkoutPlan(data: {
  memberId: string
  name: string
  description?: string
  exercises: any[]
  difficulty?: string
  goal?: string
  startDate?: Date
  endDate?: Date
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    await prisma.workoutPlan.create({
      data: {
        ...data,
        exercises: data.exercises,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_WORKOUT_PLAN',
        entity: 'WORKOUT_PLAN',
        entityId: data.memberId,
        details: `Created workout plan: ${data.name}`,
      },
    })

    revalidatePath('/workouts')
    revalidatePath(`/members/${data.memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create workout plan' }
  }
}

export async function updateWorkoutPlan(id: string, data: {
  name: string
  description?: string
  exercises: any[]
  difficulty?: string
  goal?: string
  startDate?: Date
  endDate?: Date
  active?: boolean
}) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const plan = await prisma.workoutPlan.update({
      where: { id },
      data: {
        ...data,
        exercises: data.exercises,
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_WORKOUT_PLAN',
        entity: 'WORKOUT_PLAN',
        entityId: plan.memberId,
        details: `Updated workout plan: ${data.name}`,
      },
    })

    revalidatePath('/workouts')
    revalidatePath(`/workouts/${id}`)
    revalidatePath(`/members/${plan.memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update workout plan' }
  }
}

export async function deleteWorkoutPlan(id: string) {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')

  try {
    const plan = await prisma.workoutPlan.delete({
      where: { id },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_WORKOUT_PLAN',
        entity: 'WORKOUT_PLAN',
        entityId: plan.memberId,
        details: `Deleted workout plan: ${plan.name}`,
      },
    })

    revalidatePath('/workouts')
    revalidatePath(`/members/${plan.memberId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete workout plan' }
  }
}
