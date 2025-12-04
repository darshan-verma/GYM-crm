import * as XLSX from 'xlsx'

interface Member {
  membershipNumber: string
  name: string
  email?: string
  phone: string
  status: string
  joiningDate: Date
  trainer?: {
    name: string
  }
}

interface Payment {
  invoiceNumber: string
  member: {
    name: string
    membershipNumber: string
  }
  amount: number
  paymentMode: string
  paymentDate: Date
  transactionId?: string
}

export function exportMembersToExcel(members: Member[]) {
  // Prepare data for Excel
  const data = members.map(member => ({
    'Membership No.': member.membershipNumber,
    'Name': member.name,
    'Email': member.email || 'N/A',
    'Phone': member.phone,
    'Status': member.status,
    'Joining Date': new Date(member.joiningDate).toLocaleDateString('en-IN'),
    'Trainer': member.trainer?.name || 'Not Assigned'
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
    { wch: 20 }  // Trainer
  ]

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Members')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `Members_Export_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(workbook, filename)

  return filename
}

export function exportPaymentsToExcel(payments: Payment[]) {
  // Prepare data for Excel
  const data = payments.map(payment => ({
    'Invoice No.': payment.invoiceNumber,
    'Member Name': payment.member.name,
    'Membership No.': payment.member.membershipNumber,
    'Amount (₹)': payment.amount,
    'Payment Mode': payment.paymentMode,
    'Payment Date': new Date(payment.paymentDate).toLocaleDateString('en-IN'),
    'Transaction ID': payment.transactionId || 'N/A'
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Invoice No.
    { wch: 25 }, // Member Name
    { wch: 15 }, // Membership No.
    { wch: 12 }, // Amount
    { wch: 15 }, // Payment Mode
    { wch: 15 }, // Payment Date
    { wch: 20 }  // Transaction ID
  ]

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')

  // Calculate totals
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  
  // Add summary sheet
  const summaryData = [
    { 'Metric': 'Total Payments', 'Value': payments.length },
    { 'Metric': 'Total Amount (₹)', 'Value': totalAmount.toFixed(2) },
    { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString('en-IN') }
  ]
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `Payments_Export_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(workbook, filename)

  return filename
}

// Export memberships to Excel
interface Membership {
  id: string
  member: {
    name: string
    membershipNumber: string
  }
  plan: {
    name: string
  }
  startDate: Date
  endDate: Date
  amount: number
  active: boolean
}

export function exportMembershipsToExcel(memberships: Membership[]) {
  const data = memberships.map(membership => ({
    'Member Name': membership.member.name,
    'Membership No.': membership.member.membershipNumber,
    'Plan': membership.plan.name,
    'Start Date': new Date(membership.startDate).toLocaleDateString('en-IN'),
    'End Date': new Date(membership.endDate).toLocaleDateString('en-IN'),
    'Amount (₹)': membership.amount,
    'Status': membership.active ? 'Active' : 'Inactive',
    'Days Remaining': Math.ceil((new Date(membership.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  worksheet['!cols'] = [
    { wch: 25 }, // Member Name
    { wch: 15 }, // Membership No.
    { wch: 20 }, // Plan
    { wch: 15 }, // Start Date
    { wch: 15 }, // End Date
    { wch: 12 }, // Amount
    { wch: 12 }, // Status
    { wch: 15 }  // Days Remaining
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Memberships')

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `Memberships_Export_${timestamp}.xlsx`

  XLSX.writeFile(workbook, filename)

  return filename
}

// Export attendance to Excel
interface Attendance {
  member: {
    name: string
    membershipNumber: string
  }
  checkIn: Date
  checkOut?: Date
  date: Date
  duration?: number
}

export function exportAttendanceToExcel(attendance: Attendance[]) {
  const data = attendance.map(record => ({
    'Member Name': record.member.name,
    'Membership No.': record.member.membershipNumber,
    'Date': new Date(record.date).toLocaleDateString('en-IN'),
    'Check-In': new Date(record.checkIn).toLocaleTimeString('en-IN'),
    'Check-Out': record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-IN') : 'Not checked out',
    'Duration (mins)': record.duration || 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  worksheet['!cols'] = [
    { wch: 25 }, // Member Name
    { wch: 15 }, // Membership No.
    { wch: 15 }, // Date
    { wch: 12 }, // Check-In
    { wch: 12 }, // Check-Out
    { wch: 15 }  // Duration
  ]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `Attendance_Export_${timestamp}.xlsx`

  XLSX.writeFile(workbook, filename)

  return filename
}
