'use server'

import prisma from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { hash } from 'bcryptjs'

export async function getTrainers() {
  return await prisma.user.findMany({
    where: {
      role: 'TRAINER',
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          trainedMembers: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getTrainerById(id: string) {
  return await prisma.user.findUnique({
    where: { id, role: 'TRAINER' },
    include: {
      trainedMembers: {
        include: {
          memberships: {
            where: { active: true },
            include: { plan: true },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      },
      _count: {
        select: {
          trainedMembers: true,
          activityLogs: true,
        },
      },
    },
  })
}

export async function createTrainer(data: {
  name: string
  email: string
  password: string
  phone?: string
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existing) {
      return { success: false, error: 'Email already exists' }
    }

    const hashedPassword = await hash(data.password, 10)

    const trainer = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: 'TRAINER',
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entity: 'Trainer',
        entityId: trainer.id,
        details: { name: trainer.name },
      },
    })

    revalidatePath('/trainers')
    return { success: true, data: trainer }
  } catch (error) {
    return { success: false, error: 'Failed to create trainer' }
  }
}

export async function updateTrainer(
  id: string,
  data: {
    name?: string
    email?: string
    phone?: string
    active?: boolean
  }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    const trainer = await prisma.user.update({
      where: { id, role: 'TRAINER' },
      data,
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entity: 'Trainer',
        entityId: id,
        details: { name: trainer.name },
      },
    })

    revalidatePath('/trainers')
    revalidatePath(`/trainers/${id}`)
    return { success: true, data: trainer }
  } catch (error) {
    return { success: false, error: 'Failed to update trainer' }
  }
}

export async function deleteTrainer(id: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    // Soft delete by deactivating
    const trainer = await prisma.user.update({
      where: { id, role: 'TRAINER' },
      data: { active: false },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entity: 'Trainer',
        entityId: id,
        details: { name: trainer.name },
      },
    })

    revalidatePath('/trainers')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete trainer' }
  }
}
