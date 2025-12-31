import { getAttendance, getAttendanceStats } from "@/lib/actions/attendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock } from "lucide-react";
import QuickCheckIn from "@/components/attendance/QuickCheckIn";
import { formatDate, formatDuration } from "@/lib/utils/format";

export default async function AttendancePage() {
	const [attendanceData, stats] = await Promise.all([
		getAttendance({ limit: 20 }),
		getAttendanceStats("today"),
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Attendance Tracking
				</h1>
				<p className="text-muted-foreground mt-1">
					Track member check-ins and attendance history
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Today&apos;s Check-ins
						</CardTitle>
						<div className="p-2 rounded-lg bg-blue-500/10 text-blue-700">
							<Calendar className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalCheckIns}</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Unique Members
						</CardTitle>
						<div className="p-2 rounded-lg bg-green-500/10 text-green-700">
							<Users className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.uniqueMembers}</div>
						<p className="text-xs text-muted-foreground mt-1">Today</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Avg. Duration
						</CardTitle>
						<div className="p-2 rounded-lg bg-orange-500/10 text-orange-700">
							<Clock className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatDuration(stats.avgDuration)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Check-In */}
			<QuickCheckIn />

			{/* Recent Attendance */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Check-ins</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{attendanceData.records.length === 0 ? (
							<p className="text-center text-muted-foreground py-8">
								No attendance records yet
							</p>
						) : (
							attendanceData.records.map((record) => (
								<div
									key={record.id}
									className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
								>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
											{record.member.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)}
										</div>
										<div>
											<p className="font-medium">{record.member.name}</p>
											<p className="text-sm text-muted-foreground">
												{record.member.membershipNumber}
											</p>
										</div>
									</div>

									<div className="text-right">
										<p className="font-medium">
											{new Date(record.checkIn).toLocaleTimeString("en-IN", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(record.date)}
										</p>
									</div>

									{record.duration && (
										<div className="text-sm text-muted-foreground">
											{formatDuration(record.duration)}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
