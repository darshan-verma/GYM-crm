import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <Sidebar user={session.user} />

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
