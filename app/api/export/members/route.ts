import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const trainerId = searchParams.get('trainerId')

    // Build where clause
    const where: any = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (trainerId) {
      where.trainerId = trainerId
    }

    // Fetch members
    const members = await prisma.member.findMany({
      where,
      include: {
        trainer: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Prepare data for Excel
    const data = members.map(member => ({
      'Membership No.': member.membershipNumber,
      'Name': member.name,
      'Email': member.email || 'N/A',
      'Phone': member.phone,
      'Status': member.status,
      'Joining Date': new Date(member.joiningDate).toLocaleDateString('en-IN'),
      'Trainer': member.trainer?.name || 'Not Assigned',
      'City': member.city || 'N/A',
      'Emergency Contact': member.emergencyContact || 'N/A'
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data)

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Membership No.
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 12 }, // Status
      { wch: 15 }, // Joining Date
      { wch: 20 }, // Trainer
      { wch: 15 }, // City
      { wch: 20 }  // Emergency Contact
    ]

    // Create workbook
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members')

    // Add summary sheet
    const summaryData = [
      { 'Metric': 'Total Members', 'Value': members.length },
      { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString('en-IN') },
      { 'Metric': 'Exported By', 'Value': session.user?.name || 'Unknown' }
    ]
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData)
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `Members_Export_${timestamp}.xlsx`

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export members error:', error)
    return NextResponse.json({ error: 'Failed to export members' }, { status: 500 })
  }
}
