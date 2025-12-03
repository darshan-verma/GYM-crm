'use client'

import { useState } from 'react'
import { updateLeadStatus } from '@/lib/actions/leads'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Lead, LeadStatus } from '@prisma/client'
import { Phone, Mail, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'

interface LeadsPipelineProps {
  leadsByStatus: Record<LeadStatus, Lead[]>
}

const columns: { status: LeadStatus; title: string; color: string }[] = [
  { status: 'NEW', title: 'New Leads', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { status: 'CONTACTED', title: 'Contacted', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { status: 'FOLLOW_UP', title: 'Follow-Up', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { status: 'CONVERTED', title: 'Converted', color: 'bg-green-100 text-green-800 border-green-200' },
  { status: 'LOST', title: 'Lost', color: 'bg-red-100 text-red-800 border-red-200' },
]

export default function LeadsPipeline({ leadsByStatus }: LeadsPipelineProps) {
  const [draggedLead, setDraggedLead] = useState<string | null>(null)

  async function handleDrop(status: LeadStatus) {
    if (!draggedLead) return

    const result = await updateLeadStatus(draggedLead, status)

    if (result.success) {
      toast.success('Lead Updated', {
        description: `Lead moved to ${status}`,
      })
    } else {
      toast.error('Error', {
        description: result.error,
      })
    }

    setDraggedLead(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const leads = leadsByStatus[column.status] || []

        return (
          <div
            key={column.status}
            className="flex flex-col gap-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.status)}
          >
            {/* Column Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {column.title}
                  </CardTitle>
                  <Badge variant="secondary" className={column.color}>
                    {leads.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Lead Cards */}
            <div className="space-y-2 min-h-[200px]">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDraggedLead(lead.id)}
                  onDragEnd={() => setDraggedLead(null)}
                  className="cursor-move"
                >
                  <Card className="hover:shadow-md transition-all">
                    <CardHeader className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{lead.name}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </div>
                          )}
                        </div>

                        {lead.interestedPlan && (
                          <Badge variant="outline" className="text-xs">
                            {lead.interestedPlan}
                          </Badge>
                        )}

                        {lead.followUpDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Follow-up: {formatDate(lead.followUpDate)}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link href={`tel:${lead.phone}`}>
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link href={`/leads/${lead.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ))}

              {leads.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                  No leads
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
