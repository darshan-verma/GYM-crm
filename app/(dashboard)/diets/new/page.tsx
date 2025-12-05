import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db/prisma'
import DietForm from '@/components/forms/DietForm'

export default async function NewDietPage() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const members = await prisma.member.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Diet Plan</h1>
        <p className="text-gray-600 mt-1">
          Design a personalized nutrition plan for your member
        </p>
      </div>

      <DietForm members={members} />
    </div>
  )
}
