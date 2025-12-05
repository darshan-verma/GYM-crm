import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDietPlan } from '@/lib/actions/diets'
import prisma from '@/lib/db/prisma'
import DietEditForm from '@/components/forms/DietEditForm'

export default async function EditDietPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const [plan, members] = await Promise.all([
    getDietPlan(params.id),
    prisma.member.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!plan) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Diet Plan</h1>
        <p className="text-gray-600 mt-1">
          Update the nutrition plan for {plan.member.name}
        </p>
      </div>

      <DietEditForm plan={plan} members={members} />
    </div>
  )
}
