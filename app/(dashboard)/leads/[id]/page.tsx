import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/actions/leads";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Phone, Mail, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDate, formatPhoneNumber } from "@/lib/utils/format";

const statusColors = {
	NEW: "bg-blue-100 text-blue-800 border-blue-200",
	CONTACTED: "bg-purple-100 text-purple-800 border-purple-200",
	FOLLOW_UP: "bg-yellow-100 text-yellow-800 border-yellow-200",
	CONVERTED: "bg-green-100 text-green-800 border-green-200",
	LOST: "bg-red-100 text-red-800 border-red-200",
};

const sourceLabels = {
	WALK_IN: "Walk-in",
	PHONE_CALL: "Phone Call",
	WEBSITE: "Website",
	SOCIAL_MEDIA: "Social Media",
	REFERRAL: "Referral",
	OTHER: "Other",
};

export default async function LeadDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const lead = await getLeadById(id);

	if (!lead) {
		notFound();
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Button variant="ghost" asChild>
					<Link href="/leads">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Leads
					</Link>
				</Button>
				<Button asChild>
					<Link href={`/leads/${id}/edit`}>
						<Edit className="w-4 h-4 mr-2" />
						Edit Lead
					</Link>
				</Button>
			</div>

			{/* Lead Info */}
			<div className="grid gap-6 md:grid-cols-3">
				{/* Main Info */}
				<Card className="md:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-2xl">{lead.name}</CardTitle>
								<CardDescription>Lead #{lead.id.slice(-8)}</CardDescription>
							</div>
							<Badge className={statusColors[lead.status]}>
								{lead.status.replace("_", " ")}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">{formatPhoneNumber(lead.phone)}</p>
								</div>
							</div>

							{lead.email && (
								<div className="flex items-center gap-2">
									<Mail className="w-4 h-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Email</p>
										<p className="font-medium">{lead.email}</p>
									</div>
								</div>
							)}

							<div className="flex items-center gap-2">
								<User className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Source</p>
									<p className="font-medium">{sourceLabels[lead.source]}</p>
								</div>
							</div>

							{lead.interestedPlan && (
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">
											Interested Plan
										</p>
										<p className="font-medium">{lead.interestedPlan}</p>
									</div>
								</div>
							)}
						</div>

						<Separator />

						<div className="space-y-2">
							<h3 className="font-medium">Notes</h3>
							<p className="text-sm text-muted-foreground">
								{lead.notes || "No notes available"}
							</p>
						</div>

						{lead.followUpDate && (
							<>
								<Separator />
								<div className="flex items-center gap-2">
									<Calendar className="w-4 h-4 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">
											Follow-up Date
										</p>
										<p className="font-medium">
											{formatDate(lead.followUpDate)}
										</p>
									</div>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button className="w-full" asChild>
							<Link href={`tel:${lead.phone}`}>
								<Phone className="w-4 h-4 mr-2" />
								Call Lead
							</Link>
						</Button>

						{lead.email && (
							<Button variant="outline" className="w-full" asChild>
								<Link href={`mailto:${lead.email}`}>
									<Mail className="w-4 h-4 mr-2" />
									Email Lead
								</Link>
							</Button>
						)}

						{lead.status !== "CONVERTED" && (
							<Button variant="outline" className="w-full" asChild>
								<Link href={`/members/new?leadId=${lead.id}`}>
									<User className="w-4 h-4 mr-2" />
									Convert to Member
								</Link>
							</Button>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Timeline */}
			<Card>
				<CardHeader>
					<CardTitle>Timeline</CardTitle>
					<CardDescription>Lead activity and status changes</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
							<div>
								<p className="text-sm font-medium">Lead Created</p>
								<p className="text-xs text-muted-foreground">
									{formatDate(lead.createdAt)}
								</p>
							</div>
						</div>

						{lead.lastContactDate && (
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Last Contact</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(lead.lastContactDate)}
									</p>
								</div>
							</div>
						)}

						{lead.convertedDate && (
							<div className="flex items-start gap-3">
								<div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
								<div>
									<p className="text-sm font-medium">Converted</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(lead.convertedDate)}
									</p>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
