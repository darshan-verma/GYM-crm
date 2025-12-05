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

// Exercise library templates
export const exerciseLibrary = [
  // Chest
  { name: 'Bench Press', category: 'Chest', equipment: 'Barbell', difficulty: 'INTERMEDIATE' },
  { name: 'Dumbbell Press', category: 'Chest', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Push-ups', category: 'Chest', equipment: 'Bodyweight', difficulty: 'BEGINNER' },
  { name: 'Incline Bench Press', category: 'Chest', equipment: 'Barbell', difficulty: 'INTERMEDIATE' },
  { name: 'Cable Flyes', category: 'Chest', equipment: 'Cable', difficulty: 'INTERMEDIATE' },
  
  // Back
  { name: 'Pull-ups', category: 'Back', equipment: 'Bodyweight', difficulty: 'INTERMEDIATE' },
  { name: 'Deadlift', category: 'Back', equipment: 'Barbell', difficulty: 'ADVANCED' },
  { name: 'Lat Pulldown', category: 'Back', equipment: 'Cable', difficulty: 'BEGINNER' },
  { name: 'Bent Over Row', category: 'Back', equipment: 'Barbell', difficulty: 'INTERMEDIATE' },
  { name: 'Dumbbell Row', category: 'Back', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  
  // Legs
  { name: 'Squats', category: 'Legs', equipment: 'Barbell', difficulty: 'INTERMEDIATE' },
  { name: 'Leg Press', category: 'Legs', equipment: 'Machine', difficulty: 'BEGINNER' },
  { name: 'Lunges', category: 'Legs', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Leg Curl', category: 'Legs', equipment: 'Machine', difficulty: 'BEGINNER' },
  { name: 'Leg Extension', category: 'Legs', equipment: 'Machine', difficulty: 'BEGINNER' },
  
  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', equipment: 'Barbell', difficulty: 'INTERMEDIATE' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Lateral Raises', category: 'Shoulders', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Front Raises', category: 'Shoulders', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Rear Delt Flyes', category: 'Shoulders', equipment: 'Dumbbell', difficulty: 'INTERMEDIATE' },
  
  // Arms
  { name: 'Bicep Curls', category: 'Arms', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Tricep Dips', category: 'Arms', equipment: 'Bodyweight', difficulty: 'INTERMEDIATE' },
  { name: 'Hammer Curls', category: 'Arms', equipment: 'Dumbbell', difficulty: 'BEGINNER' },
  { name: 'Tricep Pushdown', category: 'Arms', equipment: 'Cable', difficulty: 'BEGINNER' },
  { name: 'Skull Crushers', category: 'Arms', equipment: 'Barbell', difficulty: 'INTERMEDIATE' },
  
  // Core
  { name: 'Planks', category: 'Core', equipment: 'Bodyweight', difficulty: 'BEGINNER' },
  { name: 'Crunches', category: 'Core', equipment: 'Bodyweight', difficulty: 'BEGINNER' },
  { name: 'Russian Twists', category: 'Core', equipment: 'Bodyweight', difficulty: 'INTERMEDIATE' },
  { name: 'Leg Raises', category: 'Core', equipment: 'Bodyweight', difficulty: 'INTERMEDIATE' },
  { name: 'Cable Crunches', category: 'Core', equipment: 'Cable', difficulty: 'INTERMEDIATE' },
  
  // Cardio
  { name: 'Treadmill Running', category: 'Cardio', equipment: 'Machine', difficulty: 'BEGINNER' },
  { name: 'Cycling', category: 'Cardio', equipment: 'Machine', difficulty: 'BEGINNER' },
  { name: 'Rowing', category: 'Cardio', equipment: 'Machine', difficulty: 'INTERMEDIATE' },
  { name: 'Jump Rope', category: 'Cardio', equipment: 'Equipment', difficulty: 'INTERMEDIATE' },
  { name: 'Burpees', category: 'Cardio', equipment: 'Bodyweight', difficulty: 'ADVANCED' },
]
