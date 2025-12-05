import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getOverallStats,
  getRevenueReport,
  getPaymentModeDistribution,
  getMembershipReport,
  getAttendanceReport,
  getLeadsReport
} from '@/lib/actions/reports'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const [stats, revenueData, paymentModes, membershipData, attendanceData, leadsData] =
      await Promise.all([
        getOverallStats(),
        getRevenueReport(6),
        getPaymentModeDistribution(),
        getMembershipReport(6),
        getAttendanceReport(6),
        getLeadsReport(6)
      ])

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Overview sheet
    const overviewData = [
      { Metric: 'Total Members', Value: stats.totalMembers },
      { Metric: 'Active Members', Value: stats.activeMembers },
      { Metric: 'Monthly Revenue', Value: stats.currentMonthRevenue },
      { Metric: 'Revenue Growth', Value: `${stats.revenueGrowth}%` },
      { Metric: 'Monthly Attendance', Value: stats.currentMonthAttendance },
      { Metric: 'Attendance Growth', Value: `${stats.attendanceGrowth}%` },
      { Metric: 'Total Leads', Value: stats.totalLeads },
      { Metric: 'Conversion Rate', Value: `${stats.conversionRate}%` }
    ]
    const wsOverview = XLSX.utils.json_to_sheet(overviewData)
    XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview')

    // Revenue sheet
    const wsRevenue = XLSX.utils.json_to_sheet(revenueData)
    XLSX.utils.book_append_sheet(wb, wsRevenue, 'Revenue')

    // Payment Modes sheet
    const paymentModesData = paymentModes.map(pm => ({
      Mode: pm.mode,
      Amount: pm.amount,
      Count: pm.count
    }))
    const wsPaymentModes = XLSX.utils.json_to_sheet(paymentModesData)
    XLSX.utils.book_append_sheet(wb, wsPaymentModes, 'Payment Modes')

    // Membership sheet
    const wsMembership = XLSX.utils.json_to_sheet(membershipData)
    XLSX.utils.book_append_sheet(wb, wsMembership, 'Membership')

    // Attendance sheet
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceData)
    XLSX.utils.book_append_sheet(wb, wsAttendance, 'Attendance')

    // Leads sheet
    const wsLeads = XLSX.utils.json_to_sheet(leadsData)
    XLSX.utils.book_append_sheet(wb, wsLeads, 'Leads')

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Return as downloadable file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reports_${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
