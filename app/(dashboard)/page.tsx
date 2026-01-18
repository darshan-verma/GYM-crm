import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Users,
	UserCheck,
	IndianRupee,
	Calendar,
	TrendingUp,
	AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import RevenueChart from "@/components/dashboard/RevenueChart";
import MembershipChart from "@/components/dashboard/MembershipChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExpiringMemberships from "@/components/dashboard/ExpiringMemberships";

async function getDashboardStats() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const [
		totalMembers,
		activeMembers,
		todayAttendance,
		todayPayments,
		expiringThisWeek,
	] = await Promise.all([
		prisma.member.count(),
		prisma.member.count({ where: { status: "ACTIVE" } }),
		prisma.attendance.count({ where: { date: today } }),
		prisma.payment.aggregate({
			where: { paymentDate: { gte: today } },
			_sum: { amount: true },
		}),
		prisma.membership.count({
			where: {
				active: true,
				endDate: {
					lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				},
			},
		}),
	]);

	return {
		totalMembers,
		activeMembers,
		todayAttendance,
		todayRevenue: Number(todayPayments._sum.amount || 0),
		expiringThisWeek,
	};
}

export default async function DashboardPage() {
	const session = await auth();
	const stats = await getDashboardStats();

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div>
				<h1 className="text-3xl font-bold">
					Welcome back, {session?.user?.name}! 👋
				</h1>
				<p className="text-muted-foreground mt-1">
					Here&apos;s what&apos;s happening with your gym today.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Link href="/members">
					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Total Members
							</CardTitle>
							<div className="p-2 rounded-lg bg-blue-500/10 text-blue-700">
								<Users className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.totalMembers}</div>
						</CardContent>
					</Card>
				</Link>

				<Link href="/members?status=ACTIVE">
					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Active Members
							</CardTitle>
							<div className="p-2 rounded-lg bg-green-500/10 text-green-700">
								<UserCheck className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.activeMembers}</div>
						</CardContent>
					</Card>
				</Link>

				<Link href="/billing">
					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Today&apos;s Revenue
							</CardTitle>
							<div className="p-2 rounded-lg bg-orange-500/10 text-orange-700">
								<IndianRupee className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(stats.todayRevenue)}
							</div>
						</CardContent>
					</Card>
				</Link>

				<Link href="/attendance">
					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Today&apos;s Attendance
							</CardTitle>
							<div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-700">
								<Calendar className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.todayAttendance}</div>
							<p className="text-xs text-muted-foreground mt-1">
								Members checked in
							</p>
						</CardContent>
					</Card>
				</Link>

				<Link href="/memberships">
					<Card className="hover:shadow-md transition-shadow cursor-pointer">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Expiring Soon
							</CardTitle>
							<div className="p-2 rounded-lg bg-red-500/10 text-red-700">
								<AlertCircle className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.expiringThisWeek}</div>
							<p className="text-xs text-muted-foreground mt-1">
								Memberships this week
							</p>
						</CardContent>
					</Card>
				</Link>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<Link
							href="/members/new"
							className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
						>
							<Users className="w-8 h-8 text-blue-600 mb-2" />
							<span className="font-medium">Add Member</span>
						</Link>
						<Link
							href="/billing/payments/new"
							className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-green-500 hover:bg-green-50/50 transition-all cursor-pointer"
						>
							<IndianRupee className="w-8 h-8 text-green-600 mb-2" />
							<span className="font-medium">Record Payment</span>
						</Link>
						<Link
							href="/attendance"
							className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer"
						>
							<Calendar className="w-8 h-8 text-indigo-600 mb-2" />
							<span className="font-medium">Mark Attendance</span>
						</Link>
						<Link
							href="/leads/new"
							className="flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer"
						>
							<TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
							<span className="font-medium">Add Lead</span>
						</Link>
					</div>
				</CardContent>
			</Card>

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
				<ExpiringMemberships />
			</div>

			{/* Getting Started Guide */}
			<Card className="border-blue-200 bg-blue-50/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-blue-600" />
						Getting Started
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Welcome to Pro Bodyline Fitness CRM! To get started, you need to set
						up your database:
					</p>
					<div className="space-y-2 text-sm">
						<p className="font-mono bg-white p-3 rounded border">
							<strong>Step 1:</strong> Update your DATABASE_URL in .env.local
						</p>
						<p className="font-mono bg-white p-3 rounded border">
							<strong>Step 2:</strong> Run{" "}
							<code className="bg-gray-100 px-2 py-1 rounded">
								npm run db:push
							</code>{" "}
							to create tables
						</p>
						<p className="font-mono bg-white p-3 rounded border">
							<strong>Step 3:</strong> Run{" "}
							<code className="bg-gray-100 px-2 py-1 rounded">
								npm run db:seed
							</code>{" "}
							to add sample data
						</p>
						<p className="font-mono bg-white p-3 rounded border">
							<strong>Step 4:</strong> Login with:{" "}
							<code className="bg-gray-100 px-2 py-1 rounded">
								admin@probodyline.com / admin123
							</code>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
