import { MembershipPlanForm } from '@/components/forms/MembershipPlanForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewMembershipPlanPage() {
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
        <h1 className="text-3xl font-bold">Create Membership Plan</h1>
        <p className="text-gray-600 mt-1">
          Add a new membership plan with pricing and features
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <MembershipPlanForm />
      </div>
    </div>
  )
}
