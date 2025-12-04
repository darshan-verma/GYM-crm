'use server'

import prisma from '@/lib/db/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getUsers() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  })
}

export async function getUser(id: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
  })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'TRAINER' | 'RECEPTIONIST'
  phone?: string
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return { success: false, error: 'Email already in use' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_USER',
        entity: 'USER',
        entityId: user.id,
        details: `Created user: ${user.name} (${user.email})`,
      },
    })

    revalidatePath('/staff')
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, data: {
  name: string
  email: string
  role: 'ADMIN' | 'TRAINER' | 'RECEPTIONIST'
  phone?: string
  password?: string
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  try {
    // Check if email is taken by another user
    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser && existingUser.id !== id) {
        return { success: false, error: 'Email already in use' }
      }
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
    }

    // Only update password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_USER',
        entity: 'USER',
        entityId: user.id,
        details: `Updated user: ${user.name}`,
      },
    })

    revalidatePath('/staff')
    revalidatePath(`/staff/${id}/edit`)
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  // Prevent deleting yourself
  if (session.user.id === id) {
    return { success: false, error: 'Cannot delete your own account' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    await prisma.user.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_USER',
        entity: 'USER',
        entityId: id,
        details: `Deleted user: ${user.name} (${user.email})`,
      },
    })

    revalidatePath('/staff')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete user' }
  }
}
