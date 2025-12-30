import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import PaymentForm from "@/components/forms/PaymentForm";
import prisma from "@/lib/db/prisma";

export default async function NewPaymentPage() {
	// Get members with all their memberships for payment form
	const members = await prisma.member.findMany({
		include: {
			memberships: {
				include: { plan: true },
				orderBy: { createdAt: "desc" },
			},
		},
		orderBy: { name: "asc" },
	});

	// Serialize the data to convert Decimal objects to plain numbers
	const serializedMembers = JSON.parse(JSON.stringify(members));

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/billing">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Billing
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
					<p className="text-muted-foreground mt-1">
						Record a new payment from a member
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Payment Details</CardTitle>
				</CardHeader>
				<CardContent>
					<PaymentForm members={serializedMembers} />
				</CardContent>
			</Card>
		</div>
	);
}
