import { getLeadsByStatus, getLeadStats } from "@/lib/actions/leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, Phone } from "lucide-react";
import Link from "next/link";
import LeadsPipeline from "@/components/leads/LeadsPipeline";

export default async function LeadsPage() {
	const [leadsByStatus, stats] = await Promise.all([
		getLeadsByStatus(),
		getLeadStats(),
	]);

	// Serialize the data to convert Decimal objects to plain numbers
	const serializedLeadsByStatus = {
		NEW: JSON.parse(JSON.stringify(leadsByStatus.NEW)),
		CONTACTED: JSON.parse(JSON.stringify(leadsByStatus.CONTACTED)),
		FOLLOW_UP: JSON.parse(JSON.stringify(leadsByStatus.FOLLOW_UP)),
		CONVERTED: JSON.parse(JSON.stringify(leadsByStatus.CONVERTED)),
		LOST: JSON.parse(JSON.stringify(leadsByStatus.LOST)),
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Leads Management
					</h1>
					<p className="text-muted-foreground mt-1">
						Track and convert potential members
					</p>
				</div>
				<Button
					asChild
					className="bg-gradient-to-r from-orange-600 to-orange-700"
				>
					<Link href="/leads/new">
						<Plus className="w-4 h-4 mr-2" />
						Add Lead
					</Link>
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Leads
						</CardTitle>
						<div className="p-2 rounded-lg bg-blue-500/10 text-blue-700">
							<Users className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Converted
						</CardTitle>
						<div className="p-2 rounded-lg bg-green-500/10 text-green-700">
							<TrendingUp className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.converted}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.conversionRate}% conversion rate
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Need Follow-up
						</CardTitle>
						<div className="p-2 rounded-lg bg-orange-500/10 text-orange-700">
							<Phone className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{serializedLeadsByStatus.FOLLOW_UP.length}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Leads Pipeline */}
			<LeadsPipeline leadsByStatus={serializedLeadsByStatus} />
		</div>
	);
}
