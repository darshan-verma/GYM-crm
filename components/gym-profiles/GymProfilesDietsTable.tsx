'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Info, Search, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type GymProfileRow = {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
}

export default function GymProfilesDietsTable({
  profiles,
  total,
  currentPage,
  totalPages,
  limit,
}: {
  profiles: GymProfileRow[]
  total: number
  currentPage: number
  totalPages: number
  limit: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search.trim()) params.set('search', search.trim())
    else params.delete('search')
    params.delete('page')
    params.set('limit', String(limit))
    startTransition(() => {
      router.push(`/diets?${params.toString()}`)
    })
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    params.set('limit', String(limit))
    startTransition(() => {
      router.push(`/diets?${params.toString()}`)
    })
  }

  if (profiles.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">No gym profiles found</p>
      </div>
    )
  }

  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  return (
    <>
      {/* Filters */}
      <div className="p-6 border-b">
        <form onSubmit={handleSearch} className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search gyms by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              disabled={isPending}
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-md px-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Gym</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[140px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.id}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{p.phone || '-'}</div>
                  <div className="text-xs text-muted-foreground">{p.email || '-'}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.address || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/diets?gymProfileId=${encodeURIComponent(
                        p.id
                      )}&page=1&limit=${encodeURIComponent(String(limit))}`}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      View details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
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
              let pageNum: number
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

