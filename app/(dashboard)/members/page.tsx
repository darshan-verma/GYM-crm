import { Suspense } from 'react'
import { getMembers, getTrainers } from '@/lib/actions/members'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MembersTable from '@/components/members/MembersTable'

interface SearchParams {
  search?: string
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING'
  trainerId?: string
  page?: string
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [membersData, trainers] = await Promise.all([
    getMembers({
      search: searchParams.search,
      status: searchParams.status,
      trainerId: searchParams.trainerId,
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: 20,
    }),
    getTrainers()
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your gym members and memberships
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/api/export/members">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
            <Link href="/members/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Members</div>
          <div className="text-2xl font-bold mt-1">{membersData.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {membersData.members.filter(m => m.status === 'ACTIVE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Expired</div>
          <div className="text-2xl font-bold mt-1 text-red-600">
            {membersData.members.filter(m => m.status === 'EXPIRED').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">
            {membersData.members.filter(m => m.status === 'PENDING').length}
          </div>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
          <MembersTable 
            members={membersData.members}
            trainers={trainers}
            total={membersData.total}
            currentPage={membersData.currentPage}
            totalPages={membersData.pages}
          />
        </Suspense>
      </Card>
    </div>
  )
}
