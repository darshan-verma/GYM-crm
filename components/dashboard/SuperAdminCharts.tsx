"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	LineChart,
	Line,
	AreaChart,
	Area,
	Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
	Active: "hsl(142 71% 45%)",
	Expired: "hsl(0 84% 60%)",
	Suspended: "hsl(25 95% 53%)",
	Pending: "hsl(45 93% 47%)",
};

const LEAD_STATUS_COLORS: Record<string, string> = {
	NEW: "#3b82f6",
	CONTACTED: "#8b5cf6",
	"FOLLOW UP": "#f59e0b",
	CONVERTED: "#10b981",
	LOST: "#ef4444",
};

const SOURCE_COLORS = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#8b5cf6",
	"#ef4444",
	"#06b6d4",
];

const PAYMENT_MODE_COLORS: Record<string, string> = {
	CASH: "#10b981",
	ONLINE: "#3b82f6",
	UPI: "#8b5cf6",
	CARD: "#f59e0b",
	"BANK TRANSFER": "#06b6d4",
};

interface SuperAdminChartsProps {
	revenueData: Array<{ month: string; revenue: number; transactions: number }>;
	memberStatusData: Array<{ name: string; value: number }>;
	leadsData: {
		byStatus: Array<{ name: string; value: number }>;
		bySource: Array<{ name: string; value: number }>;
	};
	attendanceData: Array<{ date: string; checkIns: number }>;
	memberGrowthData: Array<{
		month: string;
		newMembers: number;
		totalMembers: number;
	}>;
	paymentModesData: Array<{ name: string; amount: number; count: number }>;
}

function formatCurrencyShort(value: number) {
	if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
	if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
	return `₹${value}`;
}

const tooltipStyle = {
	backgroundColor: "hsl(var(--background))",
	border: "1px solid hsl(var(--border))",
	borderRadius: "8px",
	fontSize: "13px",
};

export default function SuperAdminCharts({
	revenueData,
	memberStatusData,
	leadsData,
	attendanceData,
	memberGrowthData,
	paymentModesData,
}: SuperAdminChartsProps) {
	const totalMembers = memberStatusData.reduce((s, d) => s + d.value, 0);
	const totalLeads = leadsData.byStatus.reduce((s, d) => s + d.value, 0);

	return (
		<div className="space-y-6">
			{/* Row 1: Revenue + Member Status */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Revenue Trend */}
				<Card>
					<CardHeader>
						<CardTitle>Revenue Trend (All Gyms)</CardTitle>
						<CardDescription>
							Monthly revenue across all gyms for the past 6 months
						</CardDescription>
					</CardHeader>
					<CardContent>
						{revenueData.every((d) => d.revenue === 0) ? (
							<p className="text-sm text-muted-foreground text-center py-12">
								No revenue data available yet.
							</p>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={revenueData}>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-muted"
									/>
									<XAxis
										dataKey="month"
										className="text-xs"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
									/>
									<YAxis
										className="text-xs"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
										tickFormatter={formatCurrencyShort}
									/>
									<Tooltip
										contentStyle={tooltipStyle}
										formatter={(value: number, name: string) => [
											name === "revenue"
												? `₹${value.toLocaleString()}`
												: value,
											name === "revenue" ? "Revenue" : "Transactions",
										]}
									/>
									<Legend />
									<Bar
										dataKey="revenue"
										name="Revenue"
										fill="hsl(217 91% 60%)"
										radius={[6, 6, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Member Status Distribution */}
				<Card>
					<CardHeader>
						<CardTitle>Member Status Distribution</CardTitle>
						<CardDescription>
							{totalMembers} total members across all gyms
						</CardDescription>
					</CardHeader>
					<CardContent>
						{totalMembers === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-12">
								No members data available yet.
							</p>
						) : (
							<div className="flex items-center gap-4">
								<ResponsiveContainer width="60%" height={300}>
									<PieChart>
										<Pie
											data={memberStatusData}
											cx="50%"
											cy="50%"
											innerRadius={60}
											outerRadius={100}
											paddingAngle={3}
											dataKey="value"
										>
											{memberStatusData.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={STATUS_COLORS[entry.name] || "#94a3b8"}
												/>
											))}
										</Pie>
										<Tooltip contentStyle={tooltipStyle} />
									</PieChart>
								</ResponsiveContainer>
								<div className="flex-1 space-y-3">
									{memberStatusData.map((entry) => (
										<div
											key={entry.name}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{
														backgroundColor:
															STATUS_COLORS[entry.name] || "#94a3b8",
													}}
												/>
												<span className="text-sm font-medium">
													{entry.name}
												</span>
											</div>
											<div className="text-right">
												<span className="text-sm font-bold">{entry.value}</span>
												<span className="text-xs text-muted-foreground ml-1">
													(
													{totalMembers > 0
														? Math.round((entry.value / totalMembers) * 100)
														: 0}
													%)
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Row 2: Member Growth + Attendance Trend */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Member Growth */}
				<Card>
					<CardHeader>
						<CardTitle>Member Growth</CardTitle>
						<CardDescription>
							New members and cumulative total over 6 months
						</CardDescription>
					</CardHeader>
					<CardContent>
						{memberGrowthData.every(
							(d) => d.newMembers === 0 && d.totalMembers === 0
						) ? (
							<p className="text-sm text-muted-foreground text-center py-12">
								No member growth data available yet.
							</p>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={memberGrowthData}>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-muted"
									/>
									<XAxis
										dataKey="month"
										className="text-xs"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
									/>
									<YAxis
										className="text-xs"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
									/>
									<Tooltip contentStyle={tooltipStyle} />
									<Legend />
									<Area
										type="monotone"
										dataKey="totalMembers"
										name="Total Members"
										stroke="#3b82f6"
										fill="#3b82f680"
										strokeWidth={2}
									/>
									<Area
										type="monotone"
										dataKey="newMembers"
										name="New Members"
										stroke="#10b981"
										fill="#10b98140"
										strokeWidth={2}
									/>
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Attendance Trend */}
				<Card>
					<CardHeader>
						<CardTitle>Attendance Trend (Last 14 Days)</CardTitle>
						<CardDescription>
							Daily check-ins across all gyms
						</CardDescription>
					</CardHeader>
					<CardContent>
						{attendanceData.every((d) => d.checkIns === 0) ? (
							<p className="text-sm text-muted-foreground text-center py-12">
								No attendance data available yet.
							</p>
						) : (
							<ResponsiveContainer width="100%" height={300}>
								<LineChart data={attendanceData}>
									<CartesianGrid
										strokeDasharray="3 3"
										className="stroke-muted"
									/>
									<XAxis
										dataKey="date"
										className="text-xs"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
									/>
									<YAxis
										className="text-xs"
										tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
									/>
									<Tooltip contentStyle={tooltipStyle} />
									<Line
										type="monotone"
										dataKey="checkIns"
										name="Check-ins"
										stroke="#6366f1"
										strokeWidth={2.5}
										dot={{ fill: "#6366f1", r: 3 }}
										activeDot={{ r: 5 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Row 3: Leads Breakdown + Payment Modes */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Leads by Status */}
				<Card>
					<CardHeader>
						<CardTitle>Leads Pipeline</CardTitle>
						<CardDescription>
							{totalLeads} total leads across all gyms
						</CardDescription>
					</CardHeader>
					<CardContent>
						{totalLeads === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-12">
								No leads data available yet.
							</p>
						) : (
							<div className="space-y-6">
								<ResponsiveContainer width="100%" height={220}>
									<BarChart
										data={leadsData.byStatus}
										layout="vertical"
										margin={{ left: 20 }}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											className="stroke-muted"
										/>
										<XAxis
											type="number"
											className="text-xs"
											tick={{
												fill: "hsl(var(--muted-foreground))",
												fontSize: 12,
											}}
										/>
										<YAxis
											type="category"
											dataKey="name"
											className="text-xs"
											tick={{
												fill: "hsl(var(--muted-foreground))",
												fontSize: 12,
											}}
											width={90}
										/>
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]}>
											{leadsData.byStatus.map((entry, index) => (
												<Cell
													key={`cell-${index}`}
													fill={
														LEAD_STATUS_COLORS[entry.name] || SOURCE_COLORS[index % SOURCE_COLORS.length]
													}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>

								{/* Lead sources mini donut */}
								{leadsData.bySource.length > 0 && (
									<div>
										<p className="text-sm font-medium text-muted-foreground mb-2">
											By Source
										</p>
										<div className="flex items-center gap-4">
											<ResponsiveContainer width="40%" height={140}>
												<PieChart>
													<Pie
														data={leadsData.bySource}
														cx="50%"
														cy="50%"
														innerRadius={30}
														outerRadius={55}
														paddingAngle={2}
														dataKey="value"
													>
														{leadsData.bySource.map((_, index) => (
															<Cell
																key={`cell-src-${index}`}
																fill={
																	SOURCE_COLORS[index % SOURCE_COLORS.length]
																}
															/>
														))}
													</Pie>
													<Tooltip contentStyle={tooltipStyle} />
												</PieChart>
											</ResponsiveContainer>
											<div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1">
												{leadsData.bySource.map((entry, idx) => (
													<div
														key={entry.name}
														className="flex items-center gap-1.5"
													>
														<div
															className="w-2.5 h-2.5 rounded-full shrink-0"
															style={{
																backgroundColor:
																	SOURCE_COLORS[idx % SOURCE_COLORS.length],
															}}
														/>
														<span className="text-xs truncate">
															{entry.name}
														</span>
														<span className="text-xs font-bold ml-auto">
															{entry.value}
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Payment Modes */}
				<Card>
					<CardHeader>
						<CardTitle>Payment Modes (This Month)</CardTitle>
						<CardDescription>
							Revenue breakdown by payment method
						</CardDescription>
					</CardHeader>
					<CardContent>
						{paymentModesData.length === 0 ? (
							<p className="text-sm text-muted-foreground text-center py-12">
								No payments this month yet.
							</p>
						) : (
							<div className="space-y-6">
								<ResponsiveContainer width="100%" height={250}>
									<PieChart>
										<Pie
											data={paymentModesData}
											cx="50%"
											cy="50%"
											innerRadius={55}
											outerRadius={95}
											paddingAngle={3}
											dataKey="amount"
										>
											{paymentModesData.map((entry, index) => (
												<Cell
													key={`cell-pm-${index}`}
													fill={
														PAYMENT_MODE_COLORS[entry.name] ||
														SOURCE_COLORS[index % SOURCE_COLORS.length]
													}
												/>
											))}
										</Pie>
										<Tooltip
											contentStyle={tooltipStyle}
											formatter={(value: number) => [
												`₹${value.toLocaleString()}`,
												"Amount",
											]}
										/>
									</PieChart>
								</ResponsiveContainer>
								<div className="grid grid-cols-2 gap-3">
									{paymentModesData.map((entry, idx) => (
										<div
											key={entry.name}
											className="flex items-center gap-2 p-2 rounded-lg border"
										>
											<div
												className="w-3 h-3 rounded-full shrink-0"
												style={{
													backgroundColor:
														PAYMENT_MODE_COLORS[entry.name] ||
														SOURCE_COLORS[idx % SOURCE_COLORS.length],
												}}
											/>
											<div className="min-w-0">
												<p className="text-xs font-medium truncate">
													{entry.name}
												</p>
												<p className="text-xs text-muted-foreground">
													₹{entry.amount.toLocaleString()} ({entry.count} txns)
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
