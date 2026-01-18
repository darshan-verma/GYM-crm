import { getTrainers } from "@/lib/actions/members";
import { getMembershipPlans } from "@/lib/actions/memberships";
import { getLeadById } from "@/lib/actions/leads";
import MemberForm from "@/components/forms/MemberForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewMemberPage({
	searchParams,
}: {
	searchParams: Promise<{ leadId?: string }>;
}) {
	const params = await searchParams;
	const leadId = params?.leadId;

	const [trainers, membershipPlans, lead] = await Promise.all([
		getTrainers(),
		getMembershipPlans(),
		leadId ? getLeadById(leadId) : null,
	]);

	return (
		<div className="space-y-6 max-w-4xl">
			{/* Header */}
			<div>
				<Button variant="ghost" size="sm" asChild className="mb-4">
					<Link href="/members">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Members
					</Link>
				</Button>
				<h1 className="text-3xl font-bold">Add New Member</h1>
				<p className="text-muted-foreground mt-1">
					Fill in the member details to create a new profile
				</p>
			</div>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle>Member Information</CardTitle>
					<CardDescription>
						Enter the member&apos;s personal and contact details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<MemberForm
						trainers={trainers}
						membershipPlans={membershipPlans}
						leadData={
							lead
								? {
										name: lead.name,
										phone: lead.phone,
										email: lead.email || undefined,
								  }
								: undefined
						}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
