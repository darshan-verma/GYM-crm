const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

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
    prisma.membershipPlan.upsert({
      where: { name: 'Monthly Basic' },
      update: {},
      create: {
        name: 'Monthly Basic',
        description: 'Basic gym access for 1 month',
        duration: 30,
        price: 1500,
        features: ["Gym Access", "Locker"],
        color: '#3b82f6',
        active: true,
        sortOrder: 1,
      },
    }),
    prisma.membershipPlan.upsert({
      where: { name: 'Quarterly Pro' },
      update: {},
      create: {
        name: 'Quarterly Pro',
        description: 'Pro membership for 3 months with trainer',
        duration: 90,
        price: 4000,
        features: ["Gym Access", "Locker", "Personal Trainer", "Diet Plan"],
        color: '#10b981',
        popular: true,
        active: true,
        sortOrder: 2,
      },
    }),
    prisma.membershipPlan.upsert({
      where: { name: 'Annual Elite' },
      update: {},
      create: {
        name: 'Annual Elite',
        description: 'Premium membership for 1 year',
        duration: 365,
        price: 15000,
        features: ["Gym Access", "Locker", "Personal Trainer", "Diet Plan", "Supplement Guidance", "Priority Support"],
        color: '#f59e0b',
        active: true,
        sortOrder: 3,
      },
    }),
  ])
  console.log('✅ Created', plans.length, 'membership plans')

  console.log('✨ Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin: admin@probodyline.com / admin123')
  console.log('   Trainer: trainer@probodyline.com / trainer123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
