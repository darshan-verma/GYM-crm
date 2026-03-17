import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Users,
	UserCheck,
	IndianRupee,
	Calendar,
	TrendingUp,
	AlertCircle,
	Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import RevenueChart from "@/components/dashboard/RevenueChart";
import MembershipChart from "@/components/dashboard/MembershipChart";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ExpiringMemberships from "@/components/dashboard/ExpiringMemberships";
import {
	getGymDashboardStats,
	getRecentActivityForGymProfile,
	getRecentActivityGlobal,
	getSuperAdminDashboardStats,
	getTopGymsByRevenue,
	getSuperAdminRevenueChart,
	getSuperAdminMemberStatusChart,
	getSuperAdminLeadsBreakdown,
	getSuperAdminAttendanceTrend,
	getSuperAdminMemberGrowth,
	getSuperAdminPaymentModes,
} from "@/lib/actions/dashboard";
import SuperAdminCharts from "@/components/dashboard/SuperAdminCharts";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface SearchParams {
	gymProfileId?: string;
}

export default async function DashboardPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await auth();
	const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
	const params = await searchParams;
	const selectedGymProfileId = params?.gymProfileId?.trim() || null;

	if (isSuperAdmin && !selectedGymProfileId) {
		const [
			stats,
			topGyms,
			activities,
			revenueChartData,
			memberStatusData,
			leadsData,
			attendanceData,
			memberGrowthData,
			paymentModesData,
		] = await Promise.all([
			getSuperAdminDashboardStats(),
			getTopGymsByRevenue({ days: 30, limit: 5 }),
			getRecentActivityGlobal(20),
			getSuperAdminRevenueChart(6),
			getSuperAdminMemberStatusChart(),
			getSuperAdminLeadsBreakdown(),
			getSuperAdminAttendanceTrend(14),
			getSuperAdminMemberGrowth(6),
			getSuperAdminPaymentModes(),
		]);

		return (
			<div className="space-y-8">
				{/* Welcome Section */}
				<div>
					<h1 className="text-3xl font-bold">
						Welcome back, {session?.user?.name}!
					</h1>
					<p className="text-muted-foreground mt-1">
						Super Admin overview across all gyms.
					</p>
				</div>

				{/* Stats Grid */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
					<Link href="/settings">
						<Card className="hover:shadow-md transition-shadow cursor-pointer">
							<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Total Gyms
								</CardTitle>
								<div className="p-2 rounded-lg bg-slate-500/10 text-slate-700">
									<Building2 className="w-4 h-4" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stats.gymsCount}</div>
							</CardContent>
						</Card>
					</Link>

					<Card className="hover:shadow-md transition-shadow">
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
							<p className="text-xs text-muted-foreground mt-1">
								{stats.activeMembers} active
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Revenue Today
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

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Revenue This Month
							</CardTitle>
							<div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700">
								<TrendingUp className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(stats.monthRevenue)}
							</div>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Leads (All Gyms)
							</CardTitle>
							<div className="p-2 rounded-lg bg-purple-500/10 text-purple-700">
								<TrendingUp className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stats.leadsTotal}</div>
							<p className="text-xs text-muted-foreground mt-1">
								{stats.conversionRate}% converted ({stats.leadsConverted})
							</p>
						</CardContent>
					</Card>

					<Card className="hover:shadow-md transition-shadow border-red-200">
						<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Alerts
							</CardTitle>
							<div className="p-2 rounded-lg bg-red-500/10 text-red-700">
								<AlertCircle className="w-4 h-4" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{stats.alerts.gymsWithNoRevenueLast30Days}
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								Gyms with 0 revenue (last 30 days)
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Charts & Graphs */}
				<SuperAdminCharts
					revenueData={revenueChartData}
					memberStatusData={memberStatusData}
					leadsData={leadsData}
					attendanceData={attendanceData}
					memberGrowthData={memberGrowthData}
					paymentModesData={paymentModesData}
				/>

				{/* Top gyms */}
				<Card>
					<CardHeader className="flex items-center justify-between flex-row">
						<div>
							<CardTitle>Top Gyms by Revenue</CardTitle>
							<p className="text-sm text-muted-foreground mt-1">
								Last 30 days
							</p>
						</div>
						<div className="flex gap-2">
							<Link href="/reports">
								<span className="text-sm text-blue-700 hover:underline">
									View Reports
								</span>
							</Link>
						</div>
					</CardHeader>
					<CardContent>
						{topGyms.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No revenue data found.
							</p>
						) : (
							<div className="rounded-md border">
								<Table>
									<TableHeader>
										<TableRow className="bg-muted/50">
											<TableHead>Gym</TableHead>
											<TableHead>Contact</TableHead>
											<TableHead className="text-right">Revenue</TableHead>
											<TableHead className="text-right w-[220px]">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{topGyms.map((g) => (
											<TableRow key={g.gymProfileId}>
												<TableCell className="font-medium">
													{g.gymName}
												</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													<div>{g.phone || "-"}</div>
													<div>{g.email || "-"}</div>
												</TableCell>
												<TableCell className="text-right font-semibold">
													{formatCurrency(g.revenue)}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Link
															href={`/?gymProfileId=${encodeURIComponent(
																g.gymProfileId
															)}`}
															className="text-sm text-blue-700 hover:underline"
														>
															View dashboard
														</Link>
														<Link
															href={`/billing?gymProfileId=${encodeURIComponent(
																g.gymProfileId
															)}`}
															className="text-sm text-blue-700 hover:underline"
														>
															Billing
														</Link>
														<Link
															href={`/reports?gymProfileId=${encodeURIComponent(
																g.gymProfileId
															)}`}
															className="text-sm text-blue-700 hover:underline"
														>
															Reports
														</Link>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Recent Activity */}
				<div className="grid gap-4 lg:grid-cols-3">
					<div className="lg:col-span-2">
						<RecentActivity activities={activities} />
					</div>
					<Card className="border-blue-200 bg-blue-50/50">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<AlertCircle className="w-5 h-5 text-blue-600" />
								Admin Notes
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-sm text-muted-foreground">
							<p>
								Use drilldown to view a specific gym dashboard and module pages.
							</p>
							<p>
								Exports are available under <Link className="underline" href="/reports">Reports</Link>.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	// Non-super-admin OR super-admin drilldown mode
	const gymProfileId = isSuperAdmin && selectedGymProfileId ? selectedGymProfileId : null;
	const resolvedGymProfileId = gymProfileId ?? (await (async () => {
		// For non-super-admins we rely on the existing current-gym resolution logic
		const { requireCurrentGymProfileId } = await import("@/lib/actions/gym-profiles");
		return requireCurrentGymProfileId(session);
	})());

	const [stats, activities] = await Promise.all([
		getGymDashboardStats(resolvedGymProfileId),
		getRecentActivityForGymProfile(resolvedGymProfileId, 20),
	]);

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div>
				<h1 className="text-3xl font-bold">
					Welcome back, {session?.user?.name}! 👋
				</h1>
				<p className="text-muted-foreground mt-1">
					{isSuperAdmin && selectedGymProfileId
						? `Gym dashboard (view-only) • Gym: ${selectedGymProfileId}`
						: "Here’s what’s happening with your gym today."}
				</p>
				{isSuperAdmin && selectedGymProfileId ? (
					<div className="mt-3">
						<Link
							href="/"
							className="text-sm text-blue-700 hover:underline"
						>
							← Back to Super Admin overview
						</Link>
					</div>
				) : null}
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
			{!(isSuperAdmin && selectedGymProfileId) && (
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
			)}

			{/* Charts Grid */}
			<div className="grid gap-4 lg:grid-cols-2">
				<RevenueChart />
				<MembershipChart />
			</div>

			{/* Bottom Section */}
			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<RecentActivity activities={activities} />
				</div>
				{!(isSuperAdmin && selectedGymProfileId) ? <ExpiringMemberships /> : null}
			</div>

			{/* Getting Started Guide */}
			{!isSuperAdmin && (
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
			)}
		</div>
	);
}
