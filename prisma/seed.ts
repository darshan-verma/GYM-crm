import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Admin User
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@probodyline.com' },
    update: {},
    create: {
      email: 'admin@probodyline.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      phone: '9876543210',
      active: true,
    },
  })
  console.log('✅ Created admin user:', admin.email)

  // Create Trainer
  const trainerPassword = await hash('trainer123', 10)
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@probodyline.com' },
    update: {},
    create: {
      email: 'trainer@probodyline.com',
      password: trainerPassword,
      name: 'John Trainer',
      role: 'TRAINER',
      phone: '9876543211',
      active: true,
    },
  })
  console.log('✅ Created trainer user:', trainer.email)

  // Create Membership Plans
  const plans = await Promise.all([
    prisma.membershipPlan.create({
      data: {
        name: 'Monthly Basic',
        description: 'Basic gym access for 1 month',
        duration: 30,
        price: 1500,
        features: JSON.parse('["Gym Access", "Locker"]'),
        color: '#3b82f6',
        active: true,
        sortOrder: 1,
      },
    }),
    prisma.membershipPlan.create({
      data: {
        name: 'Quarterly Pro',
        description: 'Pro membership for 3 months with trainer',
        duration: 90,
        price: 4000,
        features: JSON.parse('["Gym Access", "Locker", "Personal Trainer", "Diet Plan"]'),
        color: '#10b981',
        popular: true,
        active: true,
        sortOrder: 2,
      },
    }),
    prisma.membershipPlan.create({
      data: {
        name: 'Annual Elite',
        description: 'Premium membership for 1 year',
        duration: 365,
        price: 15000,
        features: JSON.parse('["Gym Access", "Locker", "Personal Trainer", "Diet Plan", "Supplement Guidance", "Priority Support"]'),
        color: '#f59e0b',
        active: true,
        sortOrder: 3,
      },
    }),
  ])
  console.log('✅ Created', plans.length, 'membership plans')

  // Create Sample Members
  const members = []
  for (let i = 1; i <= 10; i++) {
    const member = await prisma.member.create({
      data: {
        membershipNumber: `PBF${String(1000 + i).padStart(4, '0')}`,
        name: `Member ${i}`,
        email: `member${i}@example.com`,
        phone: `98765432${String(i).padStart(2, '0')}`,
        address: `Street ${i}, City`,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gender: i % 2 === 0 ? 'Male' : 'Female',
        status: i <= 7 ? 'ACTIVE' : 'PENDING',
        trainerId: i % 3 === 0 ? trainer.id : null,
        joiningDate: new Date(2024, 0, i),
      },
    })
    members.push(member)
  }
  console.log('✅ Created', members.length, 'members')

  // Create Memberships for Active Members
  const activeMembersMemberships = []
  for (let i = 0; i < 7; i++) {
    const member = members[i]
    const plan = plans[i % plans.length]
    const startDate = new Date(2024, 10, 1)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.duration)

    const membership = await prisma.membership.create({
      data: {
        memberId: member.id,
        planId: plan.id,
        startDate,
        endDate,
        amount: plan.price,
        finalAmount: plan.price,
        active: true,
      },
    })
    activeMembersMemberships.push(membership)
  }
  console.log('✅ Created', activeMembersMemberships.length, 'active memberships')

  // Create Sample Payments
  const payments = []
  for (const membership of activeMembersMemberships) {
    const payment = await prisma.payment.create({
      data: {
        memberId: membership.memberId,
        amount: membership.finalAmount,
        paymentMode: ['CASH', 'ONLINE', 'UPI', 'CARD'][Math.floor(Math.random() * 4)] as any,
        paymentDate: membership.startDate,
        invoiceNumber: `INV${String(Date.now() + payments.length).slice(-8)}`,
        createdBy: admin.id,
      },
    })
    payments.push(payment)
  }
  console.log('✅ Created', payments.length, 'payments')

  // Create Sample Attendance Records
  const attendanceRecords = []
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    return date
  })

  for (const date of last7Days) {
    for (let i = 0; i < 5; i++) {
      const member = members[i]
      const checkIn = new Date(date)
      checkIn.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))
      
      const checkOut = new Date(checkIn)
      checkOut.setHours(checkIn.getHours() + 1 + Math.floor(Math.random() * 2))
      
      const duration = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60))

      try {
        const attendance = await prisma.attendance.create({
          data: {
            memberId: member.id,
            checkIn,
            checkOut,
            date,
            duration,
          },
        })
        attendanceRecords.push(attendance)
      } catch (e) {
        // Skip if already exists
      }
    }
  }
  console.log('✅ Created', attendanceRecords.length, 'attendance records')

  // Create Sample Leads
  const leads = []
  const leadSources = ['WALK_IN', 'PHONE_CALL', 'WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL']
  const leadStatuses = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'LOST']
  
  for (let i = 1; i <= 15; i++) {
    const lead = await prisma.lead.create({
      data: {
        name: `Lead ${i}`,
        phone: `91234567${String(i).padStart(2, '0')}`,
        email: `lead${i}@example.com`,
        source: leadSources[i % leadSources.length] as any,
        status: leadStatuses[i % leadStatuses.length] as any,
        interestedPlan: plans[i % plans.length].name,
        budget: [1500, 4000, 15000][i % 3],
        assignedTo: admin.id,
        notes: `Interested in ${plans[i % plans.length].name}`,
        createdAt: new Date(2024, 10, i),
      },
    })
    leads.push(lead)
  }
  console.log('✅ Created', leads.length, 'leads')

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
