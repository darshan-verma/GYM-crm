import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/actions/leads";
import LeadForm from "@/components/forms/LeadForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditLeadPage({
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
			<div className="flex items-center gap-4">
				<Button variant="ghost" asChild>
					<Link href={`/leads/${id}`}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Lead
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Lead</h1>
					<p className="text-muted-foreground mt-1">
						Update lead information and status
					</p>
				</div>
			</div>

			{/* Form */}
			<Card>
				<CardHeader>
					<CardTitle>Lead Details</CardTitle>
				</CardHeader>
				<CardContent>
					<LeadForm isEdit initialData={lead} />
				</CardContent>
			</Card>
		</div>
	);
}
