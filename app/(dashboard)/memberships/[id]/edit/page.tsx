import { getMembershipPlan } from '@/lib/actions/memberships'
import { MembershipPlanEditForm } from '@/components/forms/MembershipPlanEditForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditMembershipPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const plan = await getMembershipPlan(id)

  if (!plan) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/memberships" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Membership Plans
        </Link>
        <h1 className="text-3xl font-bold">Edit Membership Plan</h1>
        <p className="text-gray-600 mt-1">
          Update plan details, pricing, and features
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <MembershipPlanEditForm
          planId={id}
          initialData={{
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            duration: plan.duration,
            price: parseFloat(plan.price.toString()),
            features: plan.features as string[],
            color: plan.color || '#3b82f6',
            popular: plan.popular,
          }}
        />
      </div>
    </div>
  )
}
