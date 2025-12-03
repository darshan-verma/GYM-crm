# Pro Bodyline Fitness - CRM System

A modern, enterprise-level Gym CRM system built with Next.js 14, PostgreSQL, and a beautiful responsive UI. This system manages members, billing, trainers, attendance, leads, workout plans, and comprehensive business analytics.

## 🚀 Features

- **Member Management** - Complete member profiles, membership tracking, photo uploads
- **Billing & Payments** - Invoice generation, payment tracking, multiple payment modes
- **Attendance System** - Quick check-in, attendance history, analytics
- **Lead Management** - Kanban pipeline view, lead tracking, conversion analytics
- **Trainer Management** - Assign trainers, track their members
- **Workout & Diet Plans** - Create and manage personalized plans
- **Reports & Analytics** - Revenue reports, membership analytics, attendance trends
- **Role-Based Access Control** - Admin, Trainer, and Receptionist roles
- **Beautiful UI** - Modern design with shadcn/ui components

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, Server Components, Server Actions)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5
- **UI Components:** shadcn/ui, Tailwind CSS
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Update the `.env.local` file with your database credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/probodyline_crm?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set up the database

Push the Prisma schema to your database:

```bash
npm run db:push
```

### 4. Seed the database with sample data

```bash
npm run db:seed
```

This will create:
- Admin user: `admin@probodyline.com` / `admin123`
- Trainer user: `trainer@probodyline.com` / `trainer123`
- 10 sample members
- 3 membership plans
- Sample payments, attendance, and leads

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login

Use these credentials to login:
- **Admin:** `admin@probodyline.com` / `admin123`
- **Trainer:** `trainer@probodyline.com` / `trainer123`

## 📁 Project Structure

```
pro-bodyline-crm/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   └── ...              # Feature components
├── lib/
│   ├── actions/         # Server actions
│   ├── db/              # Database client
│   ├── utils/           # Utility functions
│   └── auth.ts          # Authentication config
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
└── public/              # Static files
```

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 🎨 Design System

- **Primary Color:** Blue (#3b82f6)
- **Typography:** Inter font family
- **Components:** shadcn/ui with custom styling
- **Responsive:** Mobile-first design (320px to 4K)

## 🔒 Security

- Password hashing with bcryptjs
- JWT-based authentication with NextAuth.js
- Role-based access control (RBAC)
- Protected API routes

---

Built with ❤️ for Pro Bodyline Fitness
