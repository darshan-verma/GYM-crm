import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import LeadForm from "@/components/forms/LeadForm";

export default function NewLeadPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/leads">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Leads
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Add Lead</h1>
					<p className="text-muted-foreground mt-1">
						Create a new lead for potential membership
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Lead Information</CardTitle>
				</CardHeader>
				<CardContent>
					<LeadForm />
				</CardContent>
			</Card>
		</div>
	);
}
