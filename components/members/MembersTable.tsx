'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, CreditCard, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatPhoneNumber } from '@/lib/utils/format'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Member {
  id: string
  name: string
  membershipNumber: string
  phone: string
  email: string | null
  photo: string | null
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING'
  trainer: { id: string; name: string } | null
  memberships: Array<{
    endDate: Date
    plan: { name: string }
  }>
  _count: { payments: number; attendance: number }
}

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  EXPIRED: 'bg-red-100 text-red-800 border-red-200',
  SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function MembersTable({
  members,
  trainers,
  total,
  currentPage,
  totalPages,
}: {
  members: Member[]
  trainers: Array<{ id: string; name: string }>
  total: number
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [trainerId, setTrainerId] = useState(searchParams.get('trainerId') || 'all')

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 when filtering
    startTransition(() => {
      router.push(`/members?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    startTransition(() => {
      router.push(`/members?${params.toString()}`)
    })
  }

  if (members.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">No members found</p>
        <Button asChild className="mt-4">
          <Link href="/members/new">Add Your First Member</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="p-6 border-b space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, membership number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          <Select value={status} onValueChange={(value) => { setStatus(value); updateFilters('status', value) }}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>

          <Select value={trainerId} onValueChange={(value) => { setTrainerId(value); updateFilters('trainerId', value) }}>
            <SelectTrigger>
              <SelectValue placeholder="All Trainers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trainers</SelectItem>
              {trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Member</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
              <TableHead className="text-right">Payments</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const activeMembership = member.memberships[0]

              return (
                <TableRow key={member.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photo || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.membershipNumber} • {formatPhoneNumber(member.phone)}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className={statusColors[member.status]}>
                      {member.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {activeMembership ? (
                      <div>
                        <div className="font-medium text-sm">
                          {activeMembership.plan.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expires: {formatDate(activeMembership.endDate)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No active membership</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {member.trainer?.name || '-'}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-sm font-medium">
                      {member._count.attendance}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-sm font-medium">
                      {member._count.payments}
                    </span>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/members/${member.id}`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/members/${member.id}/edit`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Member
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/billing/payments/new?memberId=${member.id}`} className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{(currentPage - 1) * 20 + 1}</span> to{' '}
          <span className="font-medium">{Math.min(currentPage * 20, total)}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  disabled={isPending}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </>
  )
}
