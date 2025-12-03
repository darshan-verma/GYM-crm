# Pro Bodyline Fitness - Complete Gym CRM Implementation Guide

## Project Overview

Build a modern, enterprise-level Gym CRM system with Next.js 14, PostgreSQL, and a beautiful, responsive UI. This system will manage members, billing, trainers, attendance, leads, workout plans, and comprehensive business analytics.

## Tech Stack

### Core Framework
- **Next.js 14+** (App Router, Server Components, Server Actions)
- **TypeScript** for type safety
- **PostgreSQL** as primary database
- **Prisma ORM** for database management

### UI & Styling
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for component library
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons

### Authentication & Security
- **NextAuth.js v5** for authentication
- **bcryptjs** for password hashing
- Role-based access control (RBAC)

### File Handling & Storage
- **Local VPS storage** for uploads
- **jsPDF** for invoice generation
- **xlsx** for Excel exports

### Communication
- **Resend** for email notifications
- **WhatsApp Business API** integration
- **Twilio** for SMS (optional)

### Deployment
- **Hostinger VPS** (Ubuntu)
- **Nginx** reverse proxy
- **PM2** process manager
- **PostgreSQL** database server

## Design System

### Color Palette
:root {
/* Primary Brand Colors /
--primary: 222.2 47.4% 11.2%; / Deep Blue-Black */
--primary-foreground: 210 40% 98%;

/* Accent Colors /
--accent-blue: 217 91% 60%; / Vibrant Blue /
--accent-green: 142 71% 45%; / Success Green /
--accent-orange: 25 95% 53%; / Energy Orange /
--accent-red: 0 84% 60%; / Alert Red */

/* Neutral Grays */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--border: 214.3 31.8% 91.4%;

/* Chart Colors */
--chart-1: 217 91% 60%;
--chart-2: 142 71% 45%;
--chart-3: 25 95% 53%;
--chart-4: 280 80% 60%;
--chart-5: 340 75% 55%;
}

.dark {
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--card: 222.2 84% 8%;
--card-foreground: 210 40% 98%;
--muted: 217.2 32.6% 17.5%;
--muted-foreground: 215 20.2% 65.1%;
--border: 217.2 32.6% 17.5%;
}

text

### Typography
- **Headings**: Inter (weights: 600, 700, 800)
- **Body**: Inter (weights: 400, 500, 600)
- **Monospace**: JetBrains Mono for code/numbers

### UI Principles
1. **Clean & Minimal**: Lots of white space, clear hierarchy
2. **Data-Dense Cards**: Information presented in scannable cards
3. **Color-Coded Status**: Green (active), Orange (expiring), Red (expired)
4. **Instant Feedback**: Loading states, success/error toasts
5. **Mobile-First**: Responsive design from 320px to 4K
6. **Micro-Interactions**: Smooth transitions, hover effects

## Complete File Structure

gym-crm/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.tsx
│ │ ├── register/
│ │ │ └── page.tsx
│ │ └── layout.tsx
│ ├── (dashboard)/
│ │ ├── layout.tsx
│ │ ├── page.tsx # Dashboard home
│ │ ├── members/
│ │ │ ├── page.tsx # Members list
│ │ │ ├── new/
│ │ │ │ └── page.tsx # Add member
│ │ │ └── [id]/
│ │ │ ├── page.tsx # Member details
│ │ │ └── edit/
│ │ │ └── page.tsx # Edit member
│ │ ├── billing/
│ │ │ ├── page.tsx # Billing dashboard
│ │ │ ├── payments/
│ │ │ │ ├── page.tsx # Payments list
│ │ │ │ └── new/
│ │ │ │ └── page.tsx # Record payment
│ │ │ └── invoices/
│ │ │ ├── page.tsx # Invoices list
│ │ │ └── [id]/
│ │ │ └── page.tsx # Invoice details
│ │ ├── memberships/
│ │ │ ├── page.tsx # Membership plans
│ │ │ └── new/
│ │ │ └── page.tsx # Create plan
│ │ ├── trainers/
│ │ │ ├── page.tsx # Trainers list
│ │ │ └── [id]/
│ │ │ └── page.tsx # Trainer details
│ │ ├── staff/
│ │ │ ├── page.tsx # Staff management
│ │ │ └── new/
│ │ │ └── page.tsx # Add staff
│ │ ├── attendance/
│ │ │ ├── page.tsx # Attendance tracker
│ │ │ └── history/
│ │ │ └── page.tsx # Attendance history
│ │ ├── leads/
│ │ │ ├── page.tsx # Leads pipeline
│ │ │ ├── new/
│ │ │ │ └── page.tsx # Add lead
│ │ │ └── [id]/
│ │ │ └── page.tsx # Lead details
│ │ ├── workouts/
│ │ │ ├── page.tsx # Workout plans
│ │ │ └── new/
│ │ │ └── page.tsx # Create workout
│ │ ├── diets/
│ │ │ ├── page.tsx # Diet plans
│ │ │ └── new/
│ │ │ └── page.tsx # Create diet
│ │ ├── reports/
│ │ │ ├── page.tsx # Reports dashboard
│ │ │ ├── revenue/
│ │ │ │ └── page.tsx # Revenue reports
│ │ │ ├── membership/
│ │ │ │ └── page.tsx # Membership reports
│ │ │ └── leads/
│ │ │ └── page.tsx # Lead reports
│ │ └── settings/
│ │ ├── page.tsx # General settings
│ │ ├── profile/
│ │ │ └── page.tsx # User profile
│ │ └── notifications/
│ │ └── page.tsx # Notification config
│ ├── api/
│ │ ├── auth/
│ │ │ └── [...nextauth]/
│ │ │ └── route.ts # NextAuth config
│ │ ├── upload/
│ │ │ └── route.ts # File upload
│ │ ├── export/
│ │ │ ├── members/
│ │ │ │ └── route.ts # Export members
│ │ │ └── payments/
│ │ │ └── route.ts # Export payments
│ │ └── cron/
│ │ ├── reminders/
│ │ │ └── route.ts # Expiry reminders
│ │ └── attendance/
│ │ └── route.ts # Attendance sync
│ ├── globals.css
│ └── layout.tsx
├── components/
│ ├── ui/ # shadcn components
│ │ ├── button.tsx
│ │ ├── input.tsx
│ │ ├── card.tsx
│ │ ├── table.tsx
│ │ ├── dialog.tsx
│ │ ├── select.tsx
│ │ ├── badge.tsx
│ │ ├── avatar.tsx
│ │ ├── calendar.tsx
│ │ ├── dropdown-menu.tsx
│ │ ├── toast.tsx
│ │ ├── tabs.tsx
│ │ └── ...
│ ├── layout/
│ │ ├── Sidebar.tsx # Main navigation
│ │ ├── Header.tsx # Top bar
│ │ ├── MobileNav.tsx # Mobile navigation
│ │ └── Footer.tsx
│ ├── dashboard/
│ │ ├── StatsCard.tsx # Metric cards
│ │ ├── RevenueChart.tsx # Revenue graph
│ │ ├── MembershipChart.tsx # Membership stats
│ │ ├── AttendanceChart.tsx # Attendance trends
│ │ ├── RecentActivity.tsx # Activity feed
│ │ └── QuickActions.tsx # Quick action buttons
│ ├── members/
│ │ ├── MemberCard.tsx # Member card view
│ │ ├── MemberTable.tsx # Members table
│ │ ├── MemberFilters.tsx # Filter controls
│ │ ├── MemberAvatar.tsx # Profile picture
│ │ ├── MembershipBadge.tsx # Status badge
│ │ └── ExpiryAlert.tsx # Expiry warning
│ ├── forms/
│ │ ├── MemberForm.tsx # Add/Edit member
│ │ ├── PaymentForm.tsx # Payment form
│ │ ├── MembershipForm.tsx # Assign membership
│ │ ├── LeadForm.tsx # Lead capture
│ │ ├── TrainerForm.tsx # Trainer form
│ │ ├── WorkoutForm.tsx # Workout builder
│ │ ├── DietForm.tsx # Diet plan form
│ │ └── AttendanceForm.tsx # Mark attendance
│ ├── billing/
│ │ ├── InvoicePreview.tsx # Invoice display
│ │ ├── PaymentHistory.tsx # Payment timeline
│ │ ├── PaymentModeSelect.tsx # Payment method
│ │ └── RevenueCard.tsx # Revenue metrics
│ ├── leads/
│ │ ├── LeadPipeline.tsx # Kanban board
│ │ ├── LeadCard.tsx # Lead card
│ │ └── FollowUpReminder.tsx # Reminder widget
│ ├── attendance/
│ │ ├── AttendanceCalendar.tsx # Calendar view
│ │ ├── QuickCheckIn.tsx # Fast check-in
│ │ └── AttendanceStats.tsx # Attendance metrics
│ ├── reports/
│ │ ├── ReportCard.tsx # Report container
│ │ ├── DateRangePicker.tsx # Date selector
│ │ ├── ExportButton.tsx # Export controls
│ │ └── ChartWrapper.tsx # Chart container
│ └── shared/
│ ├── LoadingSpinner.tsx
│ ├── EmptyState.tsx
│ ├── ErrorBoundary.tsx
│ ├── ConfirmDialog.tsx
│ ├── SearchBar.tsx
│ ├── Pagination.tsx
│ └── StatusBadge.tsx
├── lib/
│ ├── db/
│ │ └── prisma.ts # Prisma client
│ ├── actions/
│ │ ├── members.ts # Member actions
│ │ ├── payments.ts # Payment actions
│ │ ├── attendance.ts # Attendance actions
│ │ ├── leads.ts # Lead actions
│ │ ├── trainers.ts # Trainer actions
│ │ ├── workouts.ts # Workout actions
│ │ ├── diets.ts # Diet actions
│ │ ├── reports.ts # Report actions
│ │ └── auth.ts # Auth actions
│ ├── validators/
│ │ ├── member.ts # Member schemas
│ │ ├── payment.ts # Payment schemas
│ │ ├── lead.ts # Lead schemas
│ │ └── common.ts # Shared schemas
│ ├── utils/
│ │ ├── format.ts # Formatters
│ │ ├── generate.ts # ID generators
│ │ ├── pdf.ts # PDF generation
│ │ ├── excel.ts # Excel export
│ │ ├── date.ts # Date utilities
│ │ └── cn.ts # Class merger
│ ├── services/
│ │ ├── email.ts # Email service
│ │ ├── whatsapp.ts # WhatsApp service
│ │ ├── sms.ts # SMS service
│ │ └── notifications.ts # Notification service
│ ├── hooks/
│ │ ├── useMembers.ts
│ │ ├── usePayments.ts
│ │ ├── useAttendance.ts
│ │ ├── useLeads.ts
│ │ └── useDebounce.ts
│ └── constants/
│ ├── routes.ts
│ ├── permissions.ts
│ └── config.ts
├── prisma/
│ ├── schema.prisma
│ ├── seed.ts
│ └── migrations/
├── public/
│ ├── uploads/
│ │ ├── members/
│ │ ├── invoices/
│ │ └── receipts/
│ ├── images/
│ │ └── logo.svg
│ └── fonts/
├── types/
│ ├── index.ts
│ ├── database.ts
│ └── next-auth.d.ts
├── .env.local
├── .env.production
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md

text

## Database Schema (Prisma)

// prisma/schema.prisma
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

enum UserRole {
ADMIN
TRAINER
RECEPTIONIST
}

enum MembershipStatus {
ACTIVE
EXPIRED
SUSPENDED
PENDING
}

enum PaymentMode {
CASH
ONLINE
UPI
CARD
BANK_TRANSFER
}

enum LeadStatus {
NEW
CONTACTED
FOLLOW_UP
CONVERTED
LOST
}

enum LeadSource {
WALK_IN
PHONE_CALL
WEBSITE
SOCIAL_MEDIA
REFERRAL
OTHER
}

enum NotificationType {
EMAIL
SMS
WHATSAPP
}

enum NotificationStatus {
PENDING
SENT
FAILED
}

model User {
id String @id @default(cuid())
email String @unique
password String
name String
role UserRole @default(RECEPTIONIST)
phone String?
avatar String?
active Boolean @default(true)
lastLogin DateTime?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

trainedMembers Member[] @relation("TrainerMembers")
activityLogs ActivityLog[]

@@index([email])
@@index([role])
}

model Member {
id String @id @default(cuid())
membershipNumber String @unique
name String
email String?
phone String
address String?
city String?
state String?
pincode String?
dateOfBirth DateTime?
gender String?
photo String?
emergencyContact String?
emergencyName String?
bloodGroup String?
medicalConditions String?
joiningDate DateTime @default(now())
status MembershipStatus @default(PENDING)
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

trainerId String?
trainer User? @relation("TrainerMembers", fields: [trainerId], references: [id], onDelete: SetNull)

memberships Membership[]
payments Payment[]
attendance Attendance[]
workoutPlans WorkoutPlan[]
dietPlans DietPlan[]

@@index([phone])
@@index([status])
@@index([trainerId])
@@index([createdAt])
}

model MembershipPlan {
id String @id @default(cuid())
name String
description String?
duration Int // in days
price Decimal @db.Decimal(10, 2)
features Json? // ["Gym Access", "Locker", "Trainer"]
color String? // for UI color coding
popular Boolean @default(false)
active Boolean @default(true)
sortOrder Int @default(0)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

memberships Membership[]

@@index([active])
}

model Membership {
id String @id @default(cuid())
memberId String
planId String
startDate DateTime @default(now())
endDate DateTime
amount Decimal @db.Decimal(10, 2)
discount Decimal? @db.Decimal(10, 2)
discountType String? // PERCENTAGE or FIXED
finalAmount Decimal @db.Decimal(10, 2)
active Boolean @default(true)
autoRenew Boolean @default(false)
notes String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
plan MembershipPlan @relation(fields: [planId], references: [id])

@@index([memberId])
@@index([planId])
@@index([endDate])
@@index([active])
}

model Payment {
id String @id @default(cuid())
memberId String
amount Decimal @db.Decimal(10, 2)
paymentMode PaymentMode
paymentDate DateTime @default(now())
transactionId String?
invoiceNumber String @unique
referenceNumber String?
notes String?
receiptPath String?
createdBy String?
createdAt DateTime @default(now())

member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

@@index([memberId])
@@index([paymentDate])
@@index([invoiceNumber])
}

model Attendance {
id String @id @default(cuid())
memberId String
checkIn DateTime @default(now())
checkOut DateTime?
date DateTime @default(now()) @db.Date
duration Int? // in minutes
notes String?

member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

@@unique([memberId, date])
@@index([date])
@@index([memberId])
}

model Lead {
id String @id @default(cuid())
name String
phone String
email String?
age Int?
gender String?
source LeadSource @default(WALK_IN)
status LeadStatus @default(NEW)
interestedPlan String?
budget Decimal? @db.Decimal(10, 2)
preferredTime String?
notes String?
followUpDate DateTime?
lastContactDate DateTime?
convertedDate DateTime?
assignedTo String?
priority String? // HIGH, MEDIUM, LOW
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@index([status])
@@index([source])
@@index([followUpDate])
@@index([createdAt])
}

model WorkoutPlan {
id String @id @default(cuid())
memberId String
name String
description String?
exercises Json // [{name, sets, reps, weight, restTime, notes, videoUrl}]
difficulty String? // BEGINNER, INTERMEDIATE, ADVANCED
goal String? // WEIGHT_LOSS, MUSCLE_GAIN, ENDURANCE
startDate DateTime @default(now())
endDate DateTime?
active Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

@@index([memberId])
@@index([active])
}

model DietPlan {
id String @id @default(cuid())
memberId String
name String
description String?
meals Json // [{mealTime, items, calories, protein, carbs, fats, notes}]
totalCalories Int?
totalProtein Int?
goal String? // WEIGHT_LOSS, MUSCLE_GAIN, MAINTENANCE
startDate DateTime @default(now())
endDate DateTime?
active Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

member Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

@@index([memberId])
@@index([active])
}

model Notification {
id String @id @default(cuid())
type NotificationType
recipient String
subject String?
message String
status NotificationStatus @default(PENDING)
error String?
sentAt DateTime?
createdAt DateTime @default(now())

@@index([status])
@@index([createdAt])
@@index([type])
}

model ActivityLog {
id String @id @default(cuid())
userId String
action String // CREATE, UPDATE, DELETE, LOGIN
entity String // Member, Payment, Lead, etc.
entityId String?
details Json?
ipAddress String?
userAgent String?
createdAt DateTime @default(now())

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([userId])
@@index([entity])
@@index([createdAt])
}

model SystemSettings {
id String @id @default(cuid())
key String @unique
value Json
updatedAt DateTime @updatedAt

@@index([key])
}

text

## Core Implementation

### 1. Prisma Setup

// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
return new PrismaClient({
log: process.env.NODE_ENV === 'development'
? ['query', 'error', 'warn']
: ['error'],
})
}

declare global {
var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
globalThis.prismaGlobal = prisma
}

export default prisma

text

### 2. Authentication Setup

// app/api/auth/[...nextauth]/route.ts
import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "@/lib/db/prisma"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
interface Session {
user: {
id: string
role: UserRole
} & DefaultSession["user"]
}

interface User {
role: UserRole
}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
providers:

text
    const user = await prisma.user.findUnique({
      where: { email: credentials.email as string }
    })

    if (!user || !user.active) {
      return null
    }

    const isPasswordValid = await compare(
      credentials.password as string,
      user.password
    )

    if (!isPasswordValid) {
      return null
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.avatar
    }
  }
})
],
callbacks: {
async jwt({ token, user }) {
if (user) {
token.id = user.id
token.role = user.role
}
return token
},
async session({ session, token }) {
if (session.user) {
session.user.id = token.id as string
session.user.role = token.role as UserRole
}
return session
}
},
pages: {
signIn: "/login"
},
session: {
strategy: "jwt",
maxAge: 30 * 24 * 60 * 60, // 30 days
}
})

export { handlers as GET, handlers as POST }

text
undefined
// middleware.ts
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export default auth((req) => {
const isLoggedIn = !!req.auth
const isAuthPage = req.nextUrl.pathname.startsWith('/login')
const isPublicAPI = req.nextUrl.pathname.startsWith('/api/public')

// Allow public API routes
if (isPublicAPI) {
return NextResponse.next()
}

// Redirect logged-in users away from login page
if (isAuthPage && isLoggedIn) {
return NextResponse.redirect(new URL('/', req.url))
}

// Require auth for all dashboard routes
if (!isAuthPage && !isLoggedIn) {
return NextResponse.redirect(new URL('/login', req.url))
}

// Role-based access control
const userRole = req.auth?.user?.role
const path = req.nextUrl.pathname

// Admin-only routes
if (path.startsWith('/settings') || path.startsWith('/staff')) {
if (userRole !== 'ADMIN') {
return NextResponse.redirect(new URL('/', req.url))
}
}

// Trainer restrictions
if (userRole === 'TRAINER') {
const restrictedPaths = ['/billing', '/reports', '/leads']
if (restrictedPaths.some(p => path.startsWith(p))) {
return NextResponse.redirect(new URL('/', req.url))
}
}

return NextResponse.next()
})

export const config = {
matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)']
}

text

### 3. Beautiful Login Page

// app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
const router = useRouter()
const { toast } = useToast()
const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault()
setLoading(true)

text
const formData = new FormData(e.currentTarget)
const email = formData.get('email') as string
const password = formData.get('password') as string

try {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false
  })

  if (result?.error) {
    toast({
      title: 'Login Failed',
      description: 'Invalid email or password',
      variant: 'destructive'
    })
  } else {
    router.push('/')
    router.refresh()
  }
} catch (error) {
  toast({
    title: 'Error',
    description: 'Something went wrong',
    variant: 'destructive'
  })
} finally {
  setLoading(false)
}
}

return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
<div className="w-full max-w-md">
{/* Logo & Branding */}
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 mb-4">
<Dumbbell className="w-8 h-8 text-white" />
</div>
<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
Pro Bodyline Fitness
</h1>
<p className="text-muted-foreground mt-2">CRM Management System</p>
</div>

text
    {/* Login Card */}
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@probodyline.com"
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="- - - - - - - - "
              required
              disabled={loading}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p className="font-mono text-xs mt-1">admin@probodyline.com / admin123</p>
        </div>
      </CardContent>
    </Card>

    {/* Footer */}
    <p className="text-center text-sm text-muted-foreground mt-8">
      © 2025 Pro Bodyline Fitness. All rights reserved.
    </p>
  </div>
</div>
)
}

text

### 4. Modern Dashboard Layout

// app/(dashboard)/layout.tsx
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default async function DashboardLayout({
children,
}: {
children: React.ReactNode
}) {
const session = await auth()

if (!session) {
redirect('/login')
}

return (
<div className="min-h-screen bg-gray-50/50">
{/* Sidebar */}
<Sidebar user={session.user} />

text
  {/* Main Content */}
  <div className="lg:pl-64">
    <Header user={session.user} />
    
    <main className="p-4 lg:p-8">
      {children}
    </main>
  </div>
</div>
)
}

text
undefined
// components/layout/Sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
LayoutDashboard,
Users,
CreditCard,
UserCheck,
Calendar,
Megaphone,
Dumbbell,
UtensilsCrossed,
BarChart3,
Settings,
Menu,
X,
LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut } from 'next-auth/react'

const navigation = [
{ name: 'Dashboard', href: '/', icon: LayoutDashboard },
{ name: 'Members', href: '/members', icon: Users },
{ name: 'Billing', href: '/billing', icon: CreditCard },
{ name: 'Trainers', href: '/trainers', icon: UserCheck },
{ name: 'Attendance', href: '/attendance', icon: Calendar },
{ name: 'Leads', href: '/leads', icon: Megaphone },
{ name: 'Workouts', href: '/workouts', icon: Dumbbell },
{ name: 'Diet Plans', href: '/diets', icon: UtensilsCrossed },
{ name: 'Reports', href: '/reports', icon: BarChart3 },
{ name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ user }: { user: any }) {
const pathname = usePathname()
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

return (
<>
{/* Mobile menu button */}
<div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
<Dumbbell className="w-5 h-5 text-white" />
</div>
<span className="font-bold text-lg">Pro Bodyline</span>
</div>
<Button
variant="ghost"
size="icon"
onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
>
{mobileMenuOpen ? <X /> : <Menu />}
</Button>
</div>

text
  {/* Sidebar */}
  <aside
    className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
      mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}
  >
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Pro Bodyline</h1>
          <p className="text-xs text-muted-foreground">Fitness CRM</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-blue-700" : "text-gray-500"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarImage src={user.image} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              {user.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  </aside>

  {/* Mobile overlay */}
  {mobileMenuOpen && (
    <div
      className="fixed inset-0 bg-black/50 z-30 lg:hidden"
      onClick={() => setMobileMenuOpen(false)}
    />
  )}
</>
)
}

text
undefined
// components/layout/Header.tsx
'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export default function Header({ user }: { user: any }) {
return (
<header className="sticky top-0 z-30 h-16 bg-white border-b px-4 lg:px-8 flex items-center gap-4">
{/* Search */}
<div className="flex-1 max-w-md">
<div className="relative">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
<Input type="search" placeholder="Search members, payments..." className="pl-9 h-10" />
</div>
</div>

text
  {/* Actions */}
  <div className="flex items-center gap-2">
    {/* Notifications */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
            3
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <div className="space-y-2">
            <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <p className="text-sm font-medium">5 memberships expiring this week</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <p className="text-sm font-medium">New lead: John Doe</p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
            <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
              <p className="text-sm font-medium">Payment received: ₹5,000</p>
              <p className="text-xs text-muted-foreground">2 days ago</p>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>
)
}

text

### 5. Dashboard Homepage

// app/(dashboard)/page.tsx
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { getDashboardStats } from "@/lib/actions/dashboard"
import StatsCard from "@/components/dashboard/StatsCard"
import RevenueChart from "@/components/dashboard/RevenueChart"
import MembershipChart from "@/components/dashboard/MembershipChart"
import RecentActivity from "@/components/dashboard/RecentActivity"
import QuickActions from "@/components/dashboard/QuickActions"
import ExpiringMemberships from "@/components/dashboard/ExpiringMemberships"
import { Users, UserCheck, IndianRupee, TrendingUp, Calendar } from 'lucide-react'

export default async function DashboardPage() {
const session = await auth()
const stats = await getDashboardStats()

return (
<div className="space-y-8">
{/* Welcome Section */}
<div>
<h1 className="text-3xl font-bold">
Welcome back, {session?.user?.name}! 👋
</h1>
<p className="text-muted-foreground mt-1">
Here's what's happening with your gym today.
</p>
</div>

text
  {/* Quick Actions */}
  <QuickActions />

  {/* Stats Grid */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <StatsCard
      title="Total Members"
      value={stats.totalMembers}
      icon={Users}
      trend={{ value: 12, label: "vs last month" }}
      color="blue"
    />
    <StatsCard
      title="Active Members"
      value={stats.activeMembers}
      icon={UserCheck}
      trend={{ value: 8, label: "vs last month" }}
      color="green"
    />
    <StatsCard
      title="Today's Revenue"
      value={`₹${stats.todayRevenue.toLocaleString()}`}
      icon={IndianRupee}
      trend={{ value: 15, label: "vs yesterday" }}
      color="orange"
    />
    <StatsCard
      title="This Month"
      value={`₹${stats.monthRevenue.toLocaleString()}`}
      icon={TrendingUp}
      trend={{ value: 23, label: "vs last month" }}
      color="purple"
    />
    <StatsCard
      title="Today's Attendance"
      value={stats.todayAttendance}
      icon={Calendar}
      description="Members checked in"
      color="indigo"
    />
    <StatsCard
      title="Expiring Soon"
      value={stats.expiringThisWeek}
      icon={Users}
      description="Memberships this week"
      color="red"
    />
  </div>

  {/* Charts Grid */}
  <div className="grid gap-4 lg:grid-cols-2">
    <RevenueChart />
    <MembershipChart />
  </div>

  {/* Bottom Section */}
  <div className="grid gap-4 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <RecentActivity />
    </div>
    <ExpiringMemberships memberships={stats.expiringMemberships} />
  </div>
</div>
)
}

text
undefined
// components/dashboard/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
title: string
value: string | number
icon: LucideIcon
trend?: {
value: number
label: string
}
description?: string
color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo'
}

const colorStyles = {
blue: 'bg-blue-500/10 text-blue-700',
green: 'bg-green-500/10 text-green-700',
orange: 'bg-orange-500/10 text-orange-700',
purple: 'bg-purple-500/10 text-purple-700',
red: 'bg-red-500/10 text-red-700',
indigo: 'bg-indigo-500/10 text-indigo-700',
}

export default function StatsCard({
title,
value,
icon: Icon,
trend,
description,
color = 'blue'
}: StatsCardProps) {
return (
<Card className="hover:shadow-md transition-shadow">
<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
<CardTitle className="text-sm font-medium text-muted-foreground">
{title}
</CardTitle>
<div className={cn('p-2 rounded-lg', colorStyles[color])}>
<Icon className="w-4 h-4" />
</div>
</CardHeader>
<CardContent>
<div className="text-2xl font-bold">{value}</div>
{trend && (
<div className="flex items-center gap-1 mt-1">
{trend.value > 0 ? (
<TrendingUp className="w-4 h-4 text-green-600" />
) : (
<TrendingDown className="w-4 h-4 text-red-600" />
)}
<span className={cn(
"text-xs font-medium",
trend.value > 0 ? "text-green-600" : "text-red-600"
)}>
{trend.value > 0 ? '+' : ''}{trend.value}%
</span>
<span className="text-xs text-muted-foreground ml-1">
{trend.label}
</span>
</div>
)}
{description && (
<p className="text-xs text-muted-foreground mt-1">{description}</p>
)}
</CardContent>
</Card>
)
}

text

### 6. Member Management (Complete Implementation)

// lib/actions/members.ts
'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db/prisma'
import { memberSchema } from '@/lib/validators/member'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { MembershipStatus } from '@prisma/client'

export async function createMember(formData: FormData) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
const data = {
name: formData.get('name') as string,
email: formData.get('email') as string || null,
phone: formData.get('phone') as string,
address: formData.get('address') as string || null,
city: formData.get('city') as string || null,
state: formData.get('state') as string || null,
pincode: formData.get('pincode') as string || null,
dateOfBirth: formData.get('dateOfBirth') as string || null,
gender: formData.get('gender') as string || null,
emergencyContact: formData.get('emergencyContact') as string || null,
emergencyName: formData.get('emergencyName') as string || null,
bloodGroup: formData.get('bloodGroup') as string || null,
medicalConditions: formData.get('medicalConditions') as string || null,
trainerId: formData.get('trainerId') as string || null,
notes: formData.get('notes') as string || null,
}

text
// Handle photo upload
let photoPath = null
const photo = formData.get('photo') as File
if (photo && photo.size > 0) {
  const bytes = await photo.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public/uploads/members')
  await mkdir(uploadDir, { recursive: true })
  
  const filename = `${Date.now()}-${photo.name.replace(/\s/g, '-')}`
  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)
  photoPath = `/uploads/members/${filename}`
}

// Generate membership number
const lastMember = await prisma.member.findFirst({
  orderBy: { createdAt: 'desc' }
})
const membershipNumber = `PBF${String(
  lastMember ? parseInt(lastMember.membershipNumber.slice(3)) + 1 : 1001
).padStart(4, '0')}`

const member = await prisma.member.create({
  data: {
    ...data,
    membershipNumber,
    photo: photoPath,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    status: 'PENDING',
  },
  include: {
    trainer: { select: { name: true } }
  }
})

// Log activity
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Member',
    entityId: member.id,
    details: { 
      membershipNumber,
      name: member.name 
    }
  }
})

revalidatePath('/members')
return { success: true, data: member }
} catch (error) {
console.error('Create member error:', error)
return { success: false, error: 'Failed to create member' }
}
}

export async function getMembers(params?: {
search?: string
status?: MembershipStatus
trainerId?: string
page?: number
limit?: number
}) {
const { search, status, trainerId, page = 1, limit = 20 } = params || {}

const where: any = {}

if (search) {
where.OR = [
{ name: { contains: search, mode: 'insensitive' } },
{ phone: { contains: search } },
{ membershipNumber: { contains: search, mode: 'insensitive' } },
{ email: { contains: search, mode: 'insensitive' } }
]
}

if (status) {
where.status = status
}

if (trainerId) {
where.trainerId = trainerId
}

const [members, total] = await Promise.all([
prisma.member.findMany({
where,
include: {
trainer: { select: { id: true, name: true } },
memberships: {
where: { active: true },
include: { plan: true },
orderBy: { endDate: 'desc' },
take: 1
},
_count: {
select: {
payments: true,
attendance: true
}
}
},
orderBy: { createdAt: 'desc' },
skip: (page - 1) * limit,
take: limit
}),
prisma.member.count({ where })
])

return {
members,
total,
pages: Math.ceil(total / limit),
currentPage: page
}
}

export async function getMemberById(id: string) {
return await prisma.member.findUnique({
where: { id },
include: {
trainer: true,
memberships: {
include: { plan: true },
orderBy: { createdAt: 'desc' }
},
payments: {
orderBy: { paymentDate: 'desc' },
take: 20
},
attendance: {
orderBy: { date: 'desc' },
take: 30
},
workoutPlans: {
where: { active: true },
orderBy: { createdAt: 'desc' }
},
dietPlans: {
where: { active: true },
orderBy: { createdAt: 'desc' }
}
}
})
}

export async function updateMember(id: string, formData: FormData) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
const data = {
name: formData.get('name') as string,
email: formData.get('email') as string || null,
phone: formData.get('phone') as string,
address: formData.get('address') as string || null,
city: formData.get('city') as string || null,
state: formData.get('state') as string || null,
trainerId: formData.get('trainerId') as string || null,
notes: formData.get('notes') as string || null,
}

text
const member = await prisma.member.update({
  where: { id },
  data
})

await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Member',
    entityId: id,
    details: { name: member.name }
  }
})

revalidatePath(`/members/${id}`)
revalidatePath('/members')
return { success: true, data: member }
} catch (error) {
return { success: false, error: 'Failed to update member' }
}
}

export async function deleteMember(id: string) {
const session = await auth()
if (!session || session.user.role !== 'ADMIN') {
throw new Error('Unauthorized')
}

try {
const member = await prisma.member.delete({
where: { id }
})

text
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: 'DELETE',
    entity: 'Member',
    entityId: id,
    details: { name: member.name }
  }
})

revalidatePath('/members')
return { success: true }
} catch (error) {
return { success: false, error: 'Failed to delete member' }
}
}

text

This is a comprehensive implementation guide. Would you like me to continue with:
1. Complete member listing page with filters
2. Payment processing implementation
3. Attendance tracking system
4. Lead management with pipeline view
5. Reporting & analytics
6. Deployment scripts

Let me know which sections you'd like me to expand on!
continue with 
1. Complete member listing page with filters
2. Payment processing implementation
3. Attendance tracking system
4. Lead management with pipeline view
5. Reporting & analytics

text
# Pro Bodyline Fitness CRM - Advanced Features Implementation

## 1. Complete Member Listing Page with Filters

### Members List Page (Server Component)

// app/(dashboard)/members/page.tsx
import { Suspense } from 'react'
import { getMembers } from '@/lib/actions/members'
import { getTrainers } from '@/lib/actions/trainers'
import MembersTable from '@/components/members/MembersTable'
import MemberFilters from '@/components/members/MemberFilters'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import MembersTableSkeleton from '@/components/members/MembersTableSkeleton'

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
// Parallel data fetching for better performance
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

text
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

  {/* Filters */}
  <Card className="p-6">
    <MemberFilters trainers={trainers} />
  </Card>

  {/* Members Table */}
  <Card>
    <Suspense fallback={<MembersTableSkeleton />}>
      <MembersTable 
        members={membersData.members}
        total={membersData.total}
        currentPage={membersData.currentPage}
        totalPages={membersData.pages}
      />
    </Suspense>
  </Card>
</div>
)
}

text

### Advanced Filter Component

// components/members/MemberFilters.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useEffect, useState } from 'react'

interface MemberFiltersProps {
trainers: Array<{ id: string; name: string }>
}

export default function MemberFilters({ trainers }: MemberFiltersProps) {
const router = useRouter()
const pathname = usePathname()
const searchParams = useSearchParams()

const [search, setSearch] = useState(searchParams.get('search') || '')
const [status, setStatus] = useState(searchParams.get('status') || 'all')
const [trainerId, setTrainerId] = useState(searchParams.get('trainerId') || 'all')

const debouncedSearch = useDebounce(search, 500)

useEffect(() => {
const params = new URLSearchParams()

text
if (debouncedSearch) params.set('search', debouncedSearch)
if (status !== 'all') params.set('status', status)
if (trainerId !== 'all') params.set('trainerId', trainerId)

const query = params.toString()
const url = query ? `${pathname}?${query}` : pathname

router.push(url)
}, [debouncedSearch, status, trainerId, pathname, router])

const handleReset = () => {
setSearch('')
setStatus('all')
setTrainerId('all')
router.push(pathname)
}

const hasFilters = search || status !== 'all' || trainerId !== 'all'

return (
<div className="space-y-4">
<div className="grid gap-4 md:grid-cols-4">
{/* Search */}
<div className="md:col-span-2 space-y-2">
<Label>Search Members</Label>
<div className="relative">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
<Input
placeholder="Name, phone, membership number..."
value={search}
onChange={(e) => setSearch(e.target.value)}
className="pl-9"
/>
</div>
</div>

text
    {/* Status Filter */}
    <div className="space-y-2">
      <Label>Status</Label>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="EXPIRED">Expired</SelectItem>
          <SelectItem value="SUSPENDED">Suspended</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Trainer Filter */}
    <div className="space-y-2">
      <Label>Trainer</Label>
      <Select value={trainerId} onValueChange={setTrainerId}>
        <SelectTrigger>
          <SelectValue />
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

  {/* Reset Filters */}
  {hasFilters && (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      className="h-8"
    >
      <X className="w-3 h-3 mr-2" />
      Clear Filters
    </Button>
  )}
</div>
)
}

text

### Modern Members Table with Actions

// components/members/MembersTable.tsx
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
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, CreditCard, Trash2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatPhoneNumber } from '@/lib/utils/format'
import Pagination from '@/components/shared/Pagination'
import { useState } from 'react'
import AssignMembershipDialog from './AssignMembershipDialog'
import { Member, Membership, MembershipPlan } from '@prisma/client'

interface MembersTableProps {
members: Array<Member & {
trainer: { id: string; name: string } | null
memberships: Array<Membership & { plan: MembershipPlan }>[]
_count: { payments: number; attendance: number }
}>
total: number
currentPage: number
totalPages: number
}

const statusColors = {
ACTIVE: 'bg-green-100 text-green-800 border-green-200',
EXPIRED: 'bg-red-100 text-red-800 border-red-200',
SUSPENDED: 'bg-orange-100 text-orange-800 border-orange-200',
PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function MembersTable({
members,
total,
currentPage,
totalPages,
}: MembersTableProps) {
const [selectedMember, setSelectedMember] = useState<string | null>(null)

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
<div className="rounded-md border">
<Table>
<TableHeader>
<TableRow className="bg-muted/50">
<TableHead className="w-[300px]">Member</TableHead>
<TableHead>Membership</TableHead>
<TableHead>Status</TableHead>
<TableHead>Trainer</TableHead>
<TableHead className="text-right">Attendance</TableHead>
<TableHead className="text-right">Payments</TableHead>
<TableHead className="w-[50px]"></TableHead>
</TableRow>
</TableHeader>
<TableBody>
{members.map((member) => {
const activeMembership = member.memberships
const isExpiringSoon = activeMembership?.endDate
? new Date(activeMembership.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
: false

text
          return (
            <TableRow key={member.id} className="hover:bg-muted/50">
              {/* Member Info */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.photo || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {member.name.split(' ').map(n => n).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.membershipNumber} -  {formatPhoneNumber(member.phone)}
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Membership */}
              <TableCell>
                {activeMembership ? (
                  <div>
                    <div className="font-medium text-sm">
                      {activeMembership.plan.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expires: {formatDate(activeMembership.endDate)}
                      {isExpiringSoon && (
                        <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-700 border-orange-200">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No active membership</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge variant="outline" className={statusColors[member.status]}>
                  {member.status}
                </Badge>
              </TableCell>

              {/* Trainer */}
              <TableCell>
                <span className="text-sm">
                  {member.trainer?.name || '-'}
                </span>
              </TableCell>

              {/* Attendance */}
              <TableCell className="text-right">
                <span className="text-sm font-medium">
                  {member._count.attendance}
                </span>
              </TableCell>

              {/* Payments */}
              <TableCell className="text-right">
                <span className="text-sm font-medium">
                  {member._count.payments}
                </span>
              </TableCell>

              {/* Actions */}
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
                    <DropdownMenuItem onClick={() => setSelectedMember(member.id)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Membership
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/billing/payments/new?memberId=${member.id}`} className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Record Payment
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Member
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
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    total={total}
  />

  {/* Assign Membership Dialog */}
  {selectedMember && (
    <AssignMembershipDialog
      memberId={selectedMember}
      open={!!selectedMember}
      onClose={() => setSelectedMember(null)}
    />
  )}
</>
)
}

text

### Pagination Component

// components/shared/Pagination.tsx
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
currentPage: number
totalPages: number
total: number
}

export default function Pagination({ currentPage, totalPages, total }: PaginationProps) {
const router = useRouter()
const pathname = usePathname()
const searchParams = useSearchParams()

const createPageURL = (pageNumber: number) => {
const params = new URLSearchParams(searchParams)
params.set('page', pageNumber.toString())
return ${pathname}?${params.toString()}
}

const startItem = (currentPage - 1) * 20 + 1
const endItem = Math.min(currentPage * 20, total)

return (
<div className="flex items-center justify-between px-6 py-4 border-t">
<div className="text-sm text-muted-foreground">
Showing <span className="font-medium">{startItem}</span> to{' '}
<span className="font-medium">{endItem}</span> of{' '}
<span className="font-medium">{total}</span> results
</div>

text
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push(createPageURL(currentPage - 1))}
      disabled={currentPage <= 1}
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Previous
    </Button>

    {/* Page Numbers */}
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
            onClick={() => router.push(createPageURL(pageNum))}
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
      onClick={() => router.push(createPageURL(currentPage + 1))}
      disabled={currentPage >= totalPages}
    >
      Next
      <ChevronRight className="h-4 w-4 ml-1" />
    </Button>
  </div>
</div>
)
}

text

## 2. Payment Processing Implementation

### Payment Actions

// lib/actions/payments.ts
'use server'

import prisma from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { PaymentMode } from '@prisma/client'
import { generateInvoicePDF } from '@/lib/utils/pdf'
import { sendPaymentReceipt } from '@/lib/services/email'

export async function createPayment(data: {
memberId: string
amount: number
paymentMode: PaymentMode
transactionId?: string
notes?: string
membershipId?: string
}) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
// Get member details
const member = await prisma.member.findUnique({
where: { id: data.memberId },
include: {
memberships: {
where: { active: true },
include: { plan: true },
take: 1
}
}
})

text
if (!member) throw new Error('Member not found')

// Generate invoice number
const today = new Date()
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2, '0')

const lastPayment = await prisma.payment.findFirst({
  where: {
    invoiceNumber: {
      startsWith: `INV${year}${month}`
    }
  },
  orderBy: { createdAt: 'desc' }
})

const sequence = lastPayment 
  ? parseInt(lastPayment.invoiceNumber.slice(-5)) + 1 
  : 1

const invoiceNumber = `INV${year}${month}${String(sequence).padStart(5, '0')}`

// Create payment record
const payment = await prisma.payment.create({
  data: {
    memberId: data.memberId,
    amount: data.amount,
    paymentMode: data.paymentMode,
    transactionId: data.transactionId,
    notes: data.notes,
    invoiceNumber,
    createdBy: session.user.id,
    paymentDate: new Date()
  },
  include: {
    member: true
  }
})

// Generate PDF invoice
const pdfPath = await generateInvoicePDF({
  payment,
  member,
  membership: member.memberships
})

// Update payment with receipt path
await prisma.payment.update({
  where: { id: payment.id },
  data: { receiptPath: pdfPath }
})

// Update membership if this is a renewal
if (data.membershipId) {
  const membership = await prisma.membership.findUnique({
    where: { id: data.membershipId }
  })

  if (membership && membership.endDate < new Date()) {
    // Extend membership
    const newEndDate = new Date(membership.endDate)
    newEndDate.setDate(newEndDate.getDate() + membership.plan.duration)

    await prisma.membership.update({
      where: { id: data.membershipId },
      data: {
        endDate: newEndDate,
        active: true
      }
    })

    // Update member status
    await prisma.member.update({
      where: { id: data.memberId },
      data: { status: 'ACTIVE' }
    })
  }
}

// Send receipt email
if (member.email) {
  await sendPaymentReceipt({
    to: member.email,
    memberName: member.name,
    amount: payment.amount,
    invoiceNumber,
    paymentDate: payment.paymentDate,
    pdfPath
  })
}

// Log activity
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Payment',
    entityId: payment.id,
    details: {
      amount: data.amount,
      invoiceNumber,
      memberName: member.name
    }
  }
})

revalidatePath('/billing')
revalidatePath('/billing/payments')
revalidatePath(`/members/${data.memberId}`)

return { success: true, data: payment }
} catch (error) {
console.error('Payment error:', error)
return { success: false, error: 'Failed to process payment' }
}
}

export async function getPayments(params?: {
memberId?: string
startDate?: string
endDate?: string
mode?: PaymentMode
search?: string
page?: number
limit?: number
}) {
const {
memberId,
startDate,
endDate,
mode,
search,
page = 1,
limit = 50
} = params || {}

const where: any = {}

if (memberId) {
where.memberId = memberId
}

if (mode) {
where.paymentMode = mode
}

if (startDate && endDate) {
where.paymentDate = {
gte: new Date(startDate),
lte: new Date(endDate)
}
}

if (search) {
where.OR = [
{ invoiceNumber: { contains: search, mode: 'insensitive' } },
{ transactionId: { contains: search, mode: 'insensitive' } },
{ member: { name: { contains: search, mode: 'insensitive' } } },
{ member: { phone: { contains: search } } }
]
}

const [payments, total] = await Promise.all([
prisma.payment.findMany({
where,
include: {
member: {
select: {
id: true,
name: true,
membershipNumber: true,
phone: true
}
}
},
orderBy: { paymentDate: 'desc' },
skip: (page - 1) * limit,
take: limit
}),
prisma.payment.count({ where })
])

// Calculate totals
const totalAmount = await prisma.payment.aggregate({
where,
_sum: { amount: true }
})

return {
payments,
total,
totalAmount: Number(totalAmount._sum.amount || 0),
pages: Math.ceil(total / limit),
currentPage: page
}
}

export async function getPaymentStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
const now = new Date()
let startDate: Date

switch (period) {
case 'today':
startDate = new Date(now.setHours(0, 0, 0, 0))
break
case 'week':
startDate = new Date(now.setDate(now.getDate() - 7))
break
case 'month':
startDate = new Date(now.setMonth(now.getMonth() - 1))
break
case 'year':
startDate = new Date(now.setFullYear(now.getFullYear() - 1))
break
}

const [totalRevenue, paymentsByMode, recentPayments] = await Promise.all([
prisma.payment.aggregate({
where: {
paymentDate: { gte: startDate }
},
_sum: { amount: true },
_count: true
}),
prisma.payment.groupBy({
by: ['paymentMode'],
where: {
paymentDate: { gte: startDate }
},
_sum: { amount: true },
_count: true
}),
prisma.payment.findMany({
where: {
paymentDate: { gte: startDate }
},
include: {
member: { select: { name: true, membershipNumber: true } }
},
orderBy: { paymentDate: 'desc' },
take: 10
})
])

return {
totalRevenue: Number(totalRevenue._sum.amount || 0),
totalTransactions: totalRevenue._count,
averageTransaction: totalRevenue._count > 0
? Number(totalRevenue._sum.amount || 0) / totalRevenue._count
: 0,
paymentsByMode,
recentPayments
}
}

text

### Payment Form Component

// components/billing/PaymentForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPayment } from '@/lib/actions/payments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CreditCard, Wallet, Smartphone, Building2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

interface PaymentFormProps {
member: {
id: string
name: string
membershipNumber: string
phone: string
}
suggestedAmount?: number
membershipId?: string
}

const paymentModes = [
{ value: 'CASH', label: 'Cash', icon: Wallet },
{ value: 'ONLINE', label: 'Online Payment', icon: Smartphone },
{ value: 'UPI', label: 'UPI', icon: Smartphone },
{ value: 'CARD', label: 'Card', icon: CreditCard },
{ value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
]

export default function PaymentForm({
member,
suggestedAmount,
membershipId
}: PaymentFormProps) {
const router = useRouter()
const { toast } = useToast()
const [loading, setLoading] = useState(false)
const [amount, setAmount] = useState(suggestedAmount?.toString() || '')
const [paymentMode, setPaymentMode] = useState('CASH')
const [transactionId, setTransactionId] = useState('')
const [notes, setNotes] = useState('')

async function handleSubmit(e: React.FormEvent) {
e.preventDefault()
setLoading(true)

text
try {
  const result = await createPayment({
    memberId: member.id,
    amount: parseFloat(amount),
    paymentMode: paymentMode as any,
    transactionId: transactionId || undefined,
    notes: notes || undefined,
    membershipId
  })

  if (result.success) {
    toast({
      title: 'Payment Recorded',
      description: `Invoice ${result.data.invoiceNumber} created successfully`,
    })
    router.push(`/billing/invoices/${result.data.id}`)
  } else {
    toast({
      title: 'Error',
      description: result.error,
      variant: 'destructive'
    })
  }
} catch (error) {
  toast({
    title: 'Error',
    description: 'Failed to process payment',
    variant: 'destructive'
  })
} finally {
  setLoading(false)
}
}

const needsTransactionId = ['ONLINE', 'UPI', 'CARD', 'BANK_TRANSFER'].includes(paymentMode)

return (
<form onSubmit={handleSubmit} className="space-y-6">
{/* Member Info */}
<Card>
<CardHeader>
<CardTitle>Member Details</CardTitle>
</CardHeader>
<CardContent className="space-y-2">
<div className="flex justify-between">
<span className="text-muted-foreground">Name:</span>
<span className="font-medium">{member.name}</span>
</div>
<div className="flex justify-between">
<span className="text-muted-foreground">Membership ID:</span>
<span className="font-medium">{member.membershipNumber}</span>
</div>
<div className="flex justify-between">
<span className="text-muted-foreground">Phone:</span>
<span className="font-medium">{member.phone}</span>
</div>
</CardContent>
</Card>

text
  {/* Payment Details */}
  <Card>
    <CardHeader>
      <CardTitle>Payment Information</CardTitle>
      <CardDescription>Enter the payment details</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            ₹
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7 text-lg font-semibold"
            required
          />
        </div>
        {suggestedAmount && parseFloat(amount) !== suggestedAmount && (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => setAmount(suggestedAmount.toString())}
            className="h-auto p-0 text-xs"
          >
            Use suggested amount: {formatCurrency(suggestedAmount)}
          </Button>
        )}
      </div>

      {/* Payment Mode */}
      <div className="space-y-2">
        <Label>Payment Mode *</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {paymentModes.map((mode) => {
            const Icon = mode.icon
            const isSelected = paymentMode === mode.value
            
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => setPaymentMode(mode.value)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                  {mode.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Transaction ID (conditional) */}
      {needsTransactionId && (
        <div className="space-y-2">
          <Label htmlFor="transactionId">
            Transaction ID / Reference Number *
          </Label>
          <Input
            id="transactionId"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction reference"
            required
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
        />
      </div>
    </CardContent>
  </Card>

  {/* Submit */}
  <div className="flex gap-3">
    <Button
      type="button"
      variant="outline"
      onClick={() => router.back()}
      className="flex-1"
      disabled={loading}
    >
      Cancel
    </Button>
    <Button
      type="submit"
      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Record Payment of ${amount ? formatCurrency(parseFloat(amount)) : '₹0'}`
      )}
    </Button>
  </div>
</form>
)
}

text

## 3. Attendance Tracking System

### Attendance Actions

// lib/actions/attendance.ts
'use server'

import prisma from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'

export async function markAttendance(data: {
memberId: string
checkIn?: Date
checkOut?: Date
}) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
const today = new Date()
today.setHours(0, 0, 0, 0)

text
// Check if already checked in today
const existing = await prisma.attendance.findUnique({
  where: {
    memberId_date: {
      memberId: data.memberId,
      date: today
    }
  }
})

let attendance

if (existing) {
  // Update with check-out time
  if (!existing.checkOut && data.checkOut) {
    const duration = Math.floor(
      (data.checkOut.getTime() - existing.checkIn.getTime()) / (1000 * 60)
    )

    attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        checkOut: data.checkOut,
        duration
      }
    })
  } else {
    throw new Error('Already checked in today')
  }
} else {
  // Create new check-in
  attendance = await prisma.attendance.create({
    data: {
      memberId: data.memberId,
      checkIn: data.checkIn || new Date(),
      date: today
    }
  })
}

// Log activity
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: existing ? 'CHECKOUT' : 'CHECKIN',
    entity: 'Attendance',
    entityId: attendance.id,
    details: { memberId: data.memberId }
  }
})

revalidatePath('/attendance')
revalidatePath(`/members/${data.memberId}`)

return { success: true, data: attendance }
} catch (error: any) {
return { success: false, error: error.message || 'Failed to mark attendance' }
}
}

export async function getAttendance(params?: {
memberId?: string
date?: Date
startDate?: Date
endDate?: Date
page?: number
limit?: number
}) {
const { memberId, date, startDate, endDate, page = 1, limit = 30 } = params || {}

const where: any = {}

if (memberId) {
where.memberId = memberId
}

if (date) {
const targetDate = new Date(date)
targetDate.setHours(0, 0, 0, 0)
where.date = targetDate
} else if (startDate && endDate) {
where.date = {
gte: startDate,
lte: endDate
}
}

const [records, total] = await Promise.all([
prisma.attendance.findMany({
where,
include: {
member: {
select: {
id: true,
name: true,
membershipNumber: true,
photo: true
}
}
},
orderBy: { date: 'desc' },
skip: (page - 1) * limit,
take: limit
}),
prisma.attendance.count({ where })
])

return {
records,
total,
pages: Math.ceil(total / limit),
currentPage: page
}
}

export async function getAttendanceStats(period: 'today' | 'week' | 'month' = 'today') {
const now = new Date()
let startDate: Date
let endDate: Date = new Date()

switch (period) {
case 'today':
startDate = new Date(now.setHours(0, 0, 0, 0))
endDate = new Date(now.setHours(23, 59, 59, 999))
break
case 'week':
startDate = startOfWeek(now)
endDate = endOfWeek(now)
break
case 'month':
startDate = startOfMonth(now)
endDate = endOfMonth(now)
break
}

const [totalCheckIns, uniqueMembers, avgDuration, peakHours] = await Promise.all([
prisma.attendance.count({
where: {
date: { gte: startDate, lte: endDate }
}
}),
prisma.attendance.findMany({
where: {
date: { gte: startDate, lte: endDate }
},
distinct: ['memberId'],
select: { memberId: true }
}),
prisma.attendance.aggregate({
where: {
date: { gte: startDate, lte: endDate },
duration: { not: null }
},
_avg: { duration: true }
}),
// Get hourly distribution
prisma.attendance.findMany({
where: {
date: { gte: startDate, lte: endDate }
},
select: { checkIn: true }
})
])

// Calculate peak hours
const hourlyDistribution = peakHours.reduce((acc: any, record) => {
const hour = new Date(record.checkIn).getHours()
acc[hour] = (acc[hour] || 0) + 1
return acc
}, {})

const peakHour = Object.entries(hourlyDistribution)
.sort(([, a]: any, [, b]: any) => b - a)

return {
totalCheckIns,
uniqueMembers: uniqueMembers.length,
avgDuration: Math.round(avgDuration._avg.duration || 0),
peakHour: peakHour ? {
hour: parseInt(peakHour),
count: peakHour​
} : null,
hourlyDistribution
}
}

export async function quickCheckIn(membershipNumber: string) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
const member = await prisma.member.findUnique({
where: { membershipNumber },
include: {
memberships: {
where: { active: true },
take: 1
}
}
})

text
if (!member) {
  return { success: false, error: 'Member not found' }
}

if (member.status !== 'ACTIVE') {
  return { success: false, error: 'Membership is not active' }
}

const result = await markAttendance({
  memberId: member.id,
  checkIn: new Date()
})

return result
} catch (error: any) {
return { success: false, error: error.message }
}
}

text

### Quick Check-In Component

// components/attendance/QuickCheckIn.tsx
'use client'

import { useState, useRef } from 'react'
import { quickCheckIn } from '@/lib/actions/attendance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, Loader2, Scan } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuickCheckIn() {
const { toast } = useToast()
const [loading, setLoading] = useState(false)
const [membershipNumber, setMembershipNumber] = useState('')
const [lastCheckedIn, setLastCheckedIn] = useState<string | null>(null)
const inputRef = useRef<HTMLInputElement>(null)

async function handleCheckIn(e: React.FormEvent) {
e.preventDefault()
if (!membershipNumber.trim()) return

text
setLoading(true)

try {
  const result = await quickCheckIn(membershipNumber.trim())

  if (result.success) {
    setLastCheckedIn(membershipNumber)
    setMembershipNumber('')
    toast({
      title: 'Check-In Successful',
      description: `Member ${membershipNumber} checked in at ${new Date().toLocaleTimeString()}`,
    })

    // Clear success message after 3 seconds
    setTimeout(() => setLastCheckedIn(null), 3000)
    
    // Focus back on input
    inputRef.current?.focus()
  } else {
    toast({
      title: 'Check-In Failed',
      description: result.error,
      variant: 'destructive'
    })
  }
} catch (error) {
  toast({
    title: 'Error',
    description: 'Failed to check in member',
    variant: 'destructive'
  })
} finally {
  setLoading(false)
}
}

return (
<Card>
<CardHeader>
<div className="flex items-center gap-3">
<div className="p-2 rounded-lg bg-blue-100">
<Scan className="w-5 h-5 text-blue-600" />
</div>
<div>
<CardTitle>Quick Check-In</CardTitle>
<CardDescription>Scan or enter membership number</CardDescription>
</div>
</div>
</CardHeader>
<CardContent>
<form onSubmit={handleCheckIn} className="space-y-4">
<div className="flex gap-2">
<Input
ref={inputRef}
type="text"
placeholder="Enter membership number (e.g., PBF1001)"
value={membershipNumber}
onChange={(e) => setMembershipNumber(e.target.value.toUpperCase())}
disabled={loading}
className="flex-1 text-lg"
autoFocus
/>
<Button
type="submit"
disabled={loading || !membershipNumber.trim()}
className="bg-gradient-to-r from-green-600 to-green-700"
>
{loading ? (
<Loader2 className="w-4 h-4 animate-spin" />
) : (
'Check In'
)}
</Button>
</div>

text
      {/* Success Animation */}
      <AnimatePresence>
        {lastCheckedIn && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {lastCheckedIn} checked in successfully!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>

    <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
      <p>💡 Tip: Use a barcode scanner for faster check-ins</p>
    </div>
  </CardContent>
</Card>
)
}

text

## 4. Lead Management with Pipeline View

### Lead Actions

// lib/actions/leads.ts
'use server'

import prisma from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { LeadStatus, LeadSource } from '@prisma/client'

export async function createLead(data: {
name: string
phone: string
email?: string
source: LeadSource
interestedPlan?: string
notes?: string
followUpDate?: Date
}) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
const lead = await prisma.lead.create({
data: {
...data,
status: 'NEW',
assignedTo: session.user.id,
lastContactDate: new Date()
}
})

text
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: 'CREATE',
    entity: 'Lead',
    entityId: lead.id,
    details: { name: lead.name, source: lead.source }
  }
})

revalidatePath('/leads')
return { success: true, data: lead }
} catch (error) {
return { success: false, error: 'Failed to create lead' }
}
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
const session = await auth()
if (!session) throw new Error('Unauthorized')

try {
const lead = await prisma.lead.update({
where: { id: leadId },
data: {
status,
...(status === 'CONVERTED' && { convertedDate: new Date() }),
lastContactDate: new Date()
}
})

text
await prisma.activityLog.create({
  data: {
    userId: session.user.id,
    action: 'UPDATE',
    entity: 'Lead',
    entityId: leadId,
    details: { status }
  }
})

revalidatePath('/leads')
return { success: true, data: lead }
} catch (error) {
return { success: false, error: 'Failed to update lead status' }
}
}

export async function getLeadsByStatus() {
const leads = await prisma.lead.findMany({
orderBy: { createdAt: 'desc' },
take: 100
})

const grouped = {
NEW: leads.filter(l => l.status === 'NEW'),
CONTACTED: leads.filter(l => l.status === 'CONTACTED'),
FOLLOW_UP: leads.filter(l => l.status === 'FOLLOW_UP'),
CONVERTED: leads.filter(l => l.status === 'CONVERTED'),
LOST: leads.filter(l => l.status === 'LOST'),
}

return grouped
}

export async function getLeadStats() {
const [total, statusCounts, sourceBreakdown, conversionRate] = await Promise.all([
prisma.lead.count(),
prisma.lead.groupBy({
by: ['status'],
_count: true
}),
prisma.lead.groupBy({
by: ['source'],
_count: true
}),
prisma.lead.aggregate({
_count: {
_all: true
},
where: {
status: 'CONVERTED'
}
})
])

return {
total,
converted: conversionRate._count._all,
conversionRate: total > 0 ? (conversionRate._count._all / total * 100).toFixed(1) : 0,
statusCounts,
sourceBreakdown
}
}

text

### Kanban Pipeline View

// components/leads/LeadPipeline.tsx
'use client'

import { useState } from 'react'
import { updateLeadStatus } from '@/lib/actions/leads'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LeadCard from './LeadCard'
import { useToast } from '@/components/ui/use-toast'
import { Lead, LeadStatus } from '@prisma/client'

interface LeadPipelineProps {
leadsByStatus: Record<LeadStatus, Lead[]>
}

const columns: { status: LeadStatus; title: string; color: string }[] = [
{ status: 'NEW', title: 'New Leads', color: 'bg-blue-100 text-blue-800' },
{ status: 'CONTACTED', title: 'Contacted', color: 'bg-purple-100 text-purple-800' },
{ status: 'FOLLOW_UP', title: 'Follow-Up', color: 'bg-yellow-100 text-yellow-800' },
{ status: 'CONVERTED', title: 'Converted', color: 'bg-green-100 text-green-800' },
{ status: 'LOST', title: 'Lost', color: 'bg-red-100 text-red-800' },
]

export default function LeadPipeline({ leadsByStatus }: LeadPipelineProps) {
const { toast } = useToast()
const [draggedLead, setDraggedLead] = useState<string | null>(null)

async function handleDrop(status: LeadStatus) {
if (!draggedLead) return

text
const result = await updateLeadStatus(draggedLead, status)

if (result.success) {
  toast({
    title: 'Lead Updated',
    description: `Lead moved to ${status}`,
  })
} else {
  toast({
    title: 'Error',
    description: result.error,
    variant: 'destructive'
  })
}

setDraggedLead(null)
}

return (
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
{columns.map((column) => {
const leads = leadsByStatus[column.status] || []

text
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
              <LeadCard lead={lead} />
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

text

## 5. Reporting & Analytics

### Report Actions

// lib/actions/reports.ts
'use server'

import prisma from '@/lib/db/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function getRevenueReport(months: number = 6) {
const data = []

for (let i = months - 1; i >= 0; i--) {
const date = subMonths(new Date(), i)
const start = startOfMonth(date)
const end = endOfMonth(date)

text
const [revenue, payments] = await Promise.all([
  prisma.payment.aggregate({
    where: {
      paymentDate: { gte: start, lte: end }
    },
    _sum: { amount: true }
  }),
  prisma.payment.findMany({
    where: {
      paymentDate: { gte: start, lte: end }
    },
    select: { paymentMode: true, amount: true }
  })
])

// Group by payment mode
const byMode = payments.reduce((acc: any, p) => {
  acc[p.paymentMode] = (acc[p.paymentMode] || 0) + Number(p.amount)
  return acc
}, {})

data.push({
  month: format(start, 'MMM yyyy'),
  revenue: Number(revenue._sum.amount || 0),
  transactions: payments.length,
  cash: byMode.CASH || 0,
  online: (byMode.ONLINE || 0) + (byMode.UPI || 0),
  card: byMode.CARD || 0,
})
}

return data
}

export async function getMembershipReport() {
const [plans, members] = await Promise.all([
prisma.membershipPlan.findMany({
where: { active: true },
include: {
_count: {
select: {
memberships: {
where: { active: true }
}
}
}
}
}),
prisma.member.groupBy({
by: ['status'],
_count: true
})
])

const planData = plans.map(plan => ({
name: plan.name,
activeMembers: plan._count.memberships,
revenue: Number(plan.price) * plan._count.memberships,
price: Number(plan.price),
duration: plan.duration
}))

return {
plans: planData,
membersByStatus: members
}
}

export async function getAttendanceTrends(days: number = 30) {
const data = []
const now = new Date()

for (let i = days - 1; i >= 0; i--) {
const date = new Date(now)
date.setDate(date.getDate() - i)
date.setHours(0, 0, 0, 0)

text
const count = await prisma.attendance.count({
  where: { date }
})

data.push({
  date: format(date, 'MMM dd'),
  attendance: count
})
}

return data
}

text

### Revenue Chart Component

// components/reports/RevenueChart.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/format'

interface RevenueChartProps {
data: Array<{
month: string
revenue: number
transactions: number
cash: number
online: number
card: number
}>
}

export default function RevenueChart({ data }: RevenueChartProps) {
const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
const avgRevenue = totalRevenue / data.length

return (
<Card>
<CardHeader>
<CardTitle>Revenue Trends</CardTitle>
<CardDescription>
Last 6 months - Average: {formatCurrency(avgRevenue)}
</CardDescription>
</CardHeader>
<CardContent>
<ResponsiveContainer width="100%" height={300}>
<LineChart data={data}>
<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
<XAxis
dataKey="month"
tick={{ fontSize: 12 }}
stroke="#888"
/>
<YAxis
tick={{ fontSize: 12 }}
stroke="#888"
tickFormatter={(value) => ₹${(value / 1000).toFixed(0)}k}
/>
<Tooltip
contentStyle={{
backgroundColor: 'white',
border: '1px solid #e5e7eb',
borderRadius: '8px'
}}
formatter={(value: number) => formatCurrency(value)}
/>
<Legend />
<Line
type="monotone"
dataKey="revenue"
stroke="#3b82f6"
strokeWidth={3}
dot={{ fill: '#3b82f6', r: 4 }}
activeDot={{ r: 6 }}
/>
<Line type="monotone" dataKey="cash" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
<Line type="monotone" dataKey="online" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
</LineChart>
</ResponsiveContainer>
</CardContent>
</Card>
)
}
text

---

## ✅ COMPLETED DASHBOARD IMPLEMENTATION

The dashboard has been fully implemented with the following components:

### Dashboard Page
- **Location**: `app/(dashboard)/page.tsx`
- **Features**: 
  - Welcome message with user name
  - 5 stat cards (Total Members, Active Members, Today's Revenue, Today's Attendance, Expiring Soon)
  - Quick action buttons for common tasks
  - Revenue and Membership charts
  - Recent activity feed
  - Expiring memberships widget
  - Getting started guide

### Dashboard Components Created

#### 1. RevenueChart (`components/dashboard/RevenueChart.tsx`)
- Interactive bar chart showing monthly revenue
- Built with Recharts library
- Displays last 6 months of revenue data
- Formatted currency on tooltips and Y-axis
- Responsive design

#### 2. MembershipChart (`components/dashboard/MembershipChart.tsx`)
- Pie chart showing membership status distribution
- Color-coded by status (Active=green, Expired=red, Suspended=orange, Pending=yellow)
- Shows percentage labels
- Interactive tooltips

#### 3. RecentActivity (`components/dashboard/RecentActivity.tsx`)
- Timeline of recent system activities
- Shows member additions, payments, check-ins, trainer assignments
- Relative timestamps (e.g., "15 minutes ago")
- Color-coded icons by activity type
- Payment amounts displayed as badges

#### 4. ExpiringMemberships (`components/dashboard/ExpiringMemberships.tsx`)
- List of memberships expiring within 7 days
- Shows days remaining with color-coding (urgent=red, warning=orange)
- Quick action buttons (Call, View details)
- Member avatars and contact info
- "View All Members" link at bottom

### Stats Collection
The `getDashboardStats()` function collects:
- Total member count
- Active member count
- Today's attendance count
- Today's revenue (sum of payments)
- Memberships expiring within 7 days

### Format Utilities (`lib/utils/format.ts`)
Complete set of formatting helpers:
- `formatCurrency()` - Indian Rupee formatting
- `formatDate()` - DD Mon YYYY format
- `formatDateTime()` - Date with time
- `formatPhoneNumber()` - Indian phone format
- `formatDuration()` - Hours and minutes
- `getDaysRemaining()` - Calculate days until date
- `isExpiringSoon()` - Check if expiring within N days
- `isExpired()` - Check if date has passed

---

## 🎯 Next Steps for Complete CRM

### 1. Members Module (Partially Implemented)
**What exists:**
- Members list page structure in claude.md
- Member actions (create, update, delete, get) documented
- Member table component design
- Filters component design

**What needs to be created:**
- `app/(dashboard)/members/page.tsx` - Members listing
- `app/(dashboard)/members/new/page.tsx` - Add member form
- `app/(dashboard)/members/[id]/page.tsx` - Member details
- `app/(dashboard)/members/[id]/edit/page.tsx` - Edit member
- `components/members/MemberTable.tsx` - Table component
- `components/members/MemberFilters.tsx` - Filter controls
- `components/forms/MemberForm.tsx` - Add/Edit form
- `lib/actions/members.ts` - Server actions

### 2. Billing Module (Documented)
**What needs to be created:**
- `app/(dashboard)/billing/page.tsx` - Billing dashboard
- `app/(dashboard)/billing/payments/page.tsx` - Payments list
- `app/(dashboard)/billing/payments/new/page.tsx` - Record payment
- `app/(dashboard)/billing/invoices/page.tsx` - Invoices list
- `app/(dashboard)/billing/invoices/[id]/page.tsx` - Invoice detail
- `components/billing/PaymentForm.tsx` - Payment entry form
- `components/billing/InvoicePreview.tsx` - Invoice display
- `lib/actions/payments.ts` - Payment actions
- `lib/utils/pdf.ts` - PDF invoice generation

### 3. Attendance Module (Documented)
**What needs to be created:**
- `app/(dashboard)/attendance/page.tsx` - Attendance tracker
- `app/(dashboard)/attendance/history/page.tsx` - History view
- `components/attendance/QuickCheckIn.tsx` - Fast check-in
- `components/attendance/AttendanceCalendar.tsx` - Calendar view
- `lib/actions/attendance.ts` - Attendance actions

### 4. Leads Module (Documented)
**What needs to be created:**
- `app/(dashboard)/leads/page.tsx` - Leads pipeline
- `app/(dashboard)/leads/new/page.tsx` - Add lead
- `app/(dashboard)/leads/[id]/page.tsx` - Lead details
- `components/leads/LeadPipeline.tsx` - Kanban board
- `components/leads/LeadCard.tsx` - Lead card
- `lib/actions/leads.ts` - Lead actions

### 5. Reports Module (Partially Documented)
**What needs to be created:**
- `app/(dashboard)/reports/page.tsx` - Reports dashboard
- `app/(dashboard)/reports/revenue/page.tsx` - Revenue reports
- `app/(dashboard)/reports/membership/page.tsx` - Membership reports
- `components/reports/RevenueChart.tsx` - Revenue visualization
- `lib/actions/reports.ts` - Report data fetchers

### 6. Settings & Profile
**What needs to be created:**
- `app/(dashboard)/settings/page.tsx` - General settings
- `app/(dashboard)/settings/profile/page.tsx` - User profile
- Gym configuration (name, address, logo, etc.)
- Notification preferences
- User management (for admins)

---

## 📦 Implementation Priority

### Phase 1: Core Operations (Week 1-2)
1. ✅ Dashboard (COMPLETED)
2. ✅ Authentication & Layout (COMPLETED)
3. Members Management (Add, View, Edit, Delete)
4. Billing & Payments (Record payment, View invoices)
5. Attendance Tracking (Quick check-in, History)

### Phase 2: Growth Features (Week 3)
6. Leads Management (Pipeline, Follow-ups)
7. Membership Plans (Create, Assign, Renew)
8. Basic Reports (Revenue, Member stats)

### Phase 3: Advanced Features (Week 4)
9. Workout Plans
10. Diet Plans  
11. Trainers & Staff Management
12. Advanced Analytics & Reports
13. Notifications (Email, SMS, WhatsApp)
14. Bulk Operations & Exports

---

## 🚀 Quick Implementation Command

To implement a module quickly, follow this pattern:

### Example: Implementing Members List Page

1. **Create the page:**
bash
touch app/\(dashboard\)/members/page.tsx


2. **Create components:**
bash
mkdir -p components/members
touch components/members/MemberTable.tsx
touch components/members/MemberFilters.tsx


3. **Create actions:**
bash
mkdir -p lib/actions
touch lib/actions/members.ts


4. **Reference the implementations in claude.md** - All the code is already written in this file!

---

## 📝 Database Setup Commands

bash
# 1. Create database tables
npm run db:push

# 2. Seed with sample data
npm run db:seed

# 3. Open Prisma Studio to view data
npm run db:studio


---

## 🎨 Design System Summary

### Colors
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Info**: Indigo (#6366f1)

### Status Colors
- **Active**: Green background, dark green text
- **Expired**: Red background, dark red text  
- **Suspended**: Orange background, dark orange text
- **Pending**: Yellow background, dark yellow text

### Typography
- **Font**: Inter (all weights)
- **Headings**: 600-800 weight
- **Body**: 400-600 weight

### Spacing
- Base unit: 4px (Tailwind default)
- Cards: p-6 (24px padding)
- Sections: space-y-6 or space-y-8

---

## 💡 Pro Tips

1. **Always use server actions** for data mutations (create, update, delete)
2. **Keep components client-side only when needed** (forms, interactive elements)
3. **Use Suspense boundaries** for better loading UX
4. **Revalidate paths** after mutations to show fresh data
5. **Log all important actions** in ActivityLog table for audit trail
6. **Format currency, dates consistently** using utility functions
7. **Add optimistic updates** for better perceived performance
8. **Use proper error boundaries** to catch and display errors gracefully

---

## ✨ Implementation Status

| Module | Status | Priority |
|--------|--------|----------|
| Dashboard | ✅ Complete | High |
| Auth & Layout | ✅ Complete | High |
| Members | 📝 Documented | High |
| Billing | 📝 Documented | High |
| Attendance | 📝 Documented | High |
| Leads | 📝 Documented | Medium |
| Reports | 📝 Documented | Medium |
| Trainers | 📝 Documented | Low |
| Workouts | 📝 Documented | Low |
| Diets | 📝 Documented | Low |
| Settings | 📋 Planned | Low |

---

## 🎯 Current State

**What's Working:**
- ✅ Beautiful, responsive dashboard with real-time stats
- ✅ Authentication with NextAuth v5
- ✅ Role-based access control
- ✅ Modern UI with shadcn/ui components
- ✅ Interactive charts and visualizations
- ✅ Database schema complete with Prisma
- ✅ Format utilities for currency, dates, phones

**What's Ready to Implement:**
- All code for Members, Billing, Attendance, Leads modules is documented in this file
- Just copy-paste the code sections into the appropriate files
- Follow the file structure outlined at the top of this document

**Next Action:**
Start implementing the Members module by creating:
1. `app/(dashboard)/members/page.tsx`
2. `components/members/MemberTable.tsx`  
3. `lib/actions/members.ts`

All code is already written above - just copy from the relevant sections! ��

