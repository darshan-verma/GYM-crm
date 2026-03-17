import { auth } from "@/lib/auth";
import { requireAdminOrSuperAdmin } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	Users,
	CreditCard,
	Calendar,
	Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	getOverallStats,
	getRevenueReport,
	getPaymentModeDistribution,
	getTopRevenueByPlan,
	getMembershipReport,
	getMembershipStatusDistribution,
	getAttendanceReport,
	getAttendanceByDayOfWeek,
	getLeadsReport,
	getLeadsBySource,
	getOverallStatsForGymProfile,
	getRevenueReportForGymProfile,
	getPaymentModeDistributionForGymProfile,
	getTopRevenueByPlanForGymProfile,
	getMembershipReportForGymProfile,
	getMembershipStatusDistributionForGymProfile,
	getAttendanceReportForGymProfile,
	getAttendanceByDayOfWeekForGymProfile,
	getLeadsReportForGymProfile,
	getLeadsBySourceForGymProfile,
} from "@/lib/actions/reports";
import RevenueChart from "@/components/reports/RevenueChart";
import MembershipChart from "@/components/reports/MembershipChart";
import AttendanceChart from "@/components/reports/AttendanceChart";
import LeadsChart from "@/components/reports/LeadsChart";
import { getGymProfilesPaginated } from "@/lib/actions/gym-profiles";
import GymProfilesReportsTable from "@/components/gym-profiles/GymProfilesReportsTable";

interface TopPlan {
	name: string;
	revenue: number;
	count: number;
}

interface SearchParams {
	gymProfileId?: string;
	search?: string;
	page?: string;
	limit?: string;
}

export default async function ReportsPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await auth();

	if (!requireAdminOrSuperAdmin(session?.user?.role)) {
		redirect("/");
	}

	const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
	const params = await searchParams;
	const gymProfileId = params?.gymProfileId?.trim() || null;
	const page = params?.page ? parseInt(params.page, 10) : 1;
	const limit = params?.limit ? parseInt(params.limit, 10) : 20;

	if (isSuperAdmin && !gymProfileId) {
		const gyms = await getGymProfilesPaginated({
			search: params?.search,
			page: Number.isFinite(page) && page > 0 ? page : 1,
			limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
		});

		const serializedGyms = JSON.parse(
			JSON.stringify(gyms.profiles)
		) as typeof gyms.profiles;

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Reports & Analytics
						</h1>
						<p className="text-muted-foreground mt-1">
							Select a gym profile to view its reports
						</p>
					</div>
					<Button variant="outline" asChild>
						<Link href="/api/export/reports">
							<Download className="w-4 h-4 mr-2" />
							Export Report
						</Link>
					</Button>
				</div>

				<Card>
					<GymProfilesReportsTable
						profiles={serializedGyms}
						total={gyms.total}
						currentPage={gyms.currentPage}
						totalPages={gyms.pages}
						limit={limit}
					/>
				</Card>
			</div>
		);
	}

	const [
		stats,
		revenueData,
		paymentModes,
		topPlans,
		membershipData,
		membershipStatus,
		attendanceData,
		attendanceByDay,
		leadsData,
		leadsBySource,
	] = await Promise.all([
		isSuperAdmin && gymProfileId
			? getOverallStatsForGymProfile(gymProfileId)
			: getOverallStats(),
		isSuperAdmin && gymProfileId
			? getRevenueReportForGymProfile(gymProfileId, 6)
			: getRevenueReport(6),
		isSuperAdmin && gymProfileId
			? getPaymentModeDistributionForGymProfile(gymProfileId)
			: getPaymentModeDistribution(),
		isSuperAdmin && gymProfileId
			? getTopRevenueByPlanForGymProfile(gymProfileId)
			: getTopRevenueByPlan(),
		isSuperAdmin && gymProfileId
			? getMembershipReportForGymProfile(gymProfileId, 6)
			: getMembershipReport(6),
		isSuperAdmin && gymProfileId
			? getMembershipStatusDistributionForGymProfile(gymProfileId)
			: getMembershipStatusDistribution(),
		isSuperAdmin && gymProfileId
			? getAttendanceReportForGymProfile(gymProfileId, 6)
			: getAttendanceReport(6),
		isSuperAdmin && gymProfileId
			? getAttendanceByDayOfWeekForGymProfile(gymProfileId)
			: getAttendanceByDayOfWeek(),
		isSuperAdmin && gymProfileId
			? getLeadsReportForGymProfile(gymProfileId, 6)
			: getLeadsReport(6),
		isSuperAdmin && gymProfileId
			? getLeadsBySourceForGymProfile(gymProfileId)
			: getLeadsBySource(),
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Reports & Analytics
					</h1>
					<p className="text-muted-foreground mt-1">
						{isSuperAdmin && gymProfileId
							? `Gym reports (Super Admin) • Gym: ${gymProfileId}`
							: "View detailed reports and business analytics"}
					</p>
				</div>
				<div className="flex gap-3">
					{isSuperAdmin && gymProfileId ? (
						<Button variant="outline" asChild>
							<Link href="/reports">Back to gyms</Link>
						</Button>
					) : null}
					<Button variant="outline" asChild>
						<Link href="/api/export/reports">
							<Download className="w-4 h-4 mr-2" />
							Export Report
						</Link>
					</Button>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-blue-100">
								<CreditCard className="w-6 h-6 text-blue-600" />
							</div>
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">Monthly Revenue</p>
								<p className="text-2xl font-bold">
									₹{stats.currentMonthRevenue.toLocaleString()}
								</p>
								<div className="flex items-center gap-1 mt-1">
									{stats.revenueGrowth >= 0 ? (
										<TrendingUp className="w-3 h-3 text-green-600" />
									) : (
										<TrendingDown className="w-3 h-3 text-red-600" />
									)}
									<span
										className={`text-xs font-medium ${
											stats.revenueGrowth >= 0
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{stats.revenueGrowth >= 0 ? "+" : ""}
										{stats.revenueGrowth}%
									</span>
									<span className="text-xs text-muted-foreground">
										vs last month
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-green-100">
								<Users className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Total Members</p>
								<p className="text-2xl font-bold">{stats.totalMembers}</p>
								<p className="text-xs text-muted-foreground mt-1">
									{stats.activeMembers} active
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-purple-100">
								<Calendar className="w-6 h-6 text-purple-600" />
							</div>
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">Attendance</p>
								<p className="text-2xl font-bold">
									{stats.currentMonthAttendance}
								</p>
								<div className="flex items-center gap-1 mt-1">
									{stats.attendanceGrowth >= 0 ? (
										<TrendingUp className="w-3 h-3 text-green-600" />
									) : (
										<TrendingDown className="w-3 h-3 text-red-600" />
									)}
									<span
										className={`text-xs font-medium ${
											stats.attendanceGrowth >= 0
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										{stats.attendanceGrowth >= 0 ? "+" : ""}
										{stats.attendanceGrowth}%
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-orange-100">
								<BarChart3 className="w-6 h-6 text-orange-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Lead Conversion</p>
								<p className="text-2xl font-bold">{stats.conversionRate}%</p>
								<p className="text-xs text-muted-foreground mt-1">
									{stats.totalLeads} total leads
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Reports Tabs */}
			<Tabs defaultValue="revenue" className="space-y-6">
				<TabsList>
					<TabsTrigger value="revenue">Revenue</TabsTrigger>
					<TabsTrigger value="membership">Membership</TabsTrigger>
					<TabsTrigger value="attendance">Attendance</TabsTrigger>
					<TabsTrigger value="leads">Leads</TabsTrigger>
				</TabsList>

				{/* Revenue Report */}
				<TabsContent value="revenue" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Revenue Trend</CardTitle>
							<CardDescription>
								Monthly revenue over the last 6 months
							</CardDescription>
						</CardHeader>
						<CardContent>
							<RevenueChart data={revenueData} />
						</CardContent>
					</Card>

					{/* Revenue Breakdown */}
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Payment Modes</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{paymentModes.map((mode) => {
										const total = paymentModes.reduce(
											(sum, m) => sum + m.amount,
											0
										);
										const percentage =
											total > 0 ? (mode.amount / total) * 100 : 0;
										return (
											<div
												key={mode.mode}
												className="flex justify-between items-center"
											>
												<span className="text-sm">{mode.mode}</span>
												<div className="flex items-center gap-2">
													<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
														<div
															className="h-full bg-blue-600"
															style={{ width: `${percentage}%` }}
														/>
													</div>
													<span className="text-sm font-medium w-12 text-right">
														{Math.round(percentage)}%
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Top Revenue Plans</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{topPlans.slice(0, 5).map((plan: TopPlan) => (
										<div
											key={plan.name}
											className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
										>
											<div>
												<span className="font-medium">{plan.name}</span>
												<p className="text-xs text-muted-foreground">
													{plan.count} members
												</p>
											</div>
											<span className="text-lg font-bold text-green-600">
												₹{plan.revenue.toLocaleString()}
											</span>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Membership Report */}
				<TabsContent value="membership" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Membership Growth</CardTitle>
							<CardDescription>
								New, active, and expired members over time
							</CardDescription>
						</CardHeader>
						<CardContent>
							<MembershipChart data={membershipData} />
						</CardContent>
					</Card>

					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Status Distribution</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{membershipStatus.map((status) => {
										const total = membershipStatus.reduce(
											(sum, s) => sum + s.count,
											0
										);
										const percentage =
											total > 0 ? (status.count / total) * 100 : 0;
										const colors: Record<string, string> = {
											ACTIVE: "bg-green-600",
											EXPIRED: "bg-red-600",
											SUSPENDED: "bg-orange-600",
											PENDING: "bg-yellow-600",
										};
										return (
											<div
												key={status.status}
												className="flex justify-between items-center"
											>
												<span className="text-sm">{status.status}</span>
												<div className="flex items-center gap-2">
													<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
														<div
															className={`h-full ${colors[status.status]}`}
															style={{ width: `${percentage}%` }}
														/>
													</div>
													<span className="text-sm font-medium w-12 text-right">
														{status.count}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Key Metrics</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
									<span className="text-sm font-medium">Active Rate</span>
									<span className="text-xl font-bold text-green-700">
										{stats.totalMembers > 0
											? Math.round(
													(stats.activeMembers / stats.totalMembers) * 100
											  )
											: 0}
										%
									</span>
								</div>
								<div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
									<span className="text-sm font-medium">Total Members</span>
									<span className="text-xl font-bold text-blue-700">
										{stats.totalMembers}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Attendance Report */}
				<TabsContent value="attendance" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Attendance Trends</CardTitle>
							<CardDescription>
								Check-ins and unique members over time
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AttendanceChart data={attendanceData} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Attendance by Day of Week</CardTitle>
							<CardDescription>Last month&apos;s distribution</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{attendanceByDay.map((day) => {
									const max = Math.max(...attendanceByDay.map((d) => d.count));
									const percentage = max > 0 ? (day.count / max) * 100 : 0;
									return (
										<div key={day.day} className="flex items-center gap-4">
											<span className="text-sm font-medium w-12">
												{day.day}
											</span>
											<div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-end px-3"
													style={{ width: `${percentage}%` }}
												>
													<span className="text-xs font-semibold text-white">
														{day.count}
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Leads Report */}
				<TabsContent value="leads" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Lead Conversion Trends</CardTitle>
							<CardDescription>
								New leads, conversions, and losses over time
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LeadsChart data={leadsData} />
						</CardContent>
					</Card>

					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Lead Sources</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{leadsBySource.map((source) => {
										const total = leadsBySource.reduce(
											(sum, s) => sum + s.count,
											0
										);
										const percentage =
											total > 0 ? (source.count / total) * 100 : 0;
										return (
											<div
												key={source.source}
												className="flex justify-between items-center"
											>
												<span className="text-sm">{source.source}</span>
												<div className="flex items-center gap-2">
													<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
														<div
															className="h-full bg-orange-600"
															style={{ width: `${percentage}%` }}
														/>
													</div>
													<span className="text-sm font-medium w-12 text-right">
														{source.count}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Conversion Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
									<span className="text-sm font-medium">Conversion Rate</span>
									<span className="text-xl font-bold text-green-700">
										{stats.conversionRate}%
									</span>
								</div>
								<div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
									<span className="text-sm font-medium">Total Leads</span>
									<span className="text-xl font-bold text-orange-700">
										{stats.totalLeads}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
