import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { getActiveGymProfile } from "@/lib/actions/gym-profiles"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  const activeGym = await getActiveGymProfile()
  const gymTitle = activeGym?.name ?? "Pro Bodyline"

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <Sidebar user={session.user} gymTitle={gymTitle} />

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
