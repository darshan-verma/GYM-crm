"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
	members: Array<{
		id: string;
		name: string;
		membershipNumber: string;
		memberships: Array<{
			id: string;
			plan: { name: string };
			endDate: Date;
			active: boolean;
		}>;
	}>;
}

export default function PaymentForm({ members }: PaymentFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedMember, setSelectedMember] = useState<string>("");

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const data = {
			memberId: formData.get("memberId") as string,
			amount: parseFloat(formData.get("amount") as string),
			paymentMode: formData.get("paymentMode") as
				| "CASH"
				| "ONLINE"
				| "UPI"
				| "CARD"
				| "BANK_TRANSFER",
			notes: (formData.get("notes") as string) || undefined,
			membershipId: (formData.get("membershipId") as string) || undefined,
		};

		try {
			const result = await createPayment(data);

			if (result.success) {
				toast.success("Payment recorded successfully");
				router.push("/billing");
				router.refresh();
			} else {
				toast.error(result.error || "Failed to record payment");
			}
		} catch (_error) {
			toast.error("Failed to record payment");
		} finally {
			setLoading(false);
		}
	}

	const selectedMemberData = members.find((m) => m.id === selectedMember);
	const _activeMembership = selectedMemberData?.memberships.find(
		(m) => m.active
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2">
				{/* Member Selection */}
				<div className="space-y-2">
					<Label htmlFor="memberId">Member *</Label>
					<Select
						name="memberId"
						value={selectedMember}
						onValueChange={setSelectedMember}
						disabled={loading}
						required
					>
						<SelectTrigger>
							<SelectValue placeholder="Select member" />
						</SelectTrigger>
						<SelectContent>
							{members.map((member) => (
								<SelectItem key={member.id} value={member.id}>
									{member.name} ({member.membershipNumber})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Membership Selection (if member has memberships) */}
				{selectedMemberData && selectedMemberData.memberships.length > 0 && (
					<div className="space-y-2">
						<Label htmlFor="membershipId">Membership (Optional)</Label>
						<Select name="membershipId" disabled={loading}>
							<SelectTrigger>
								<SelectValue placeholder="Select membership to renew" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No specific membership</SelectItem>
								{selectedMemberData.memberships.map((membership) => (
									<SelectItem key={membership.id} value={membership.id}>
										{membership.plan.name} - Expires:{" "}
										{new Date(membership.endDate).toLocaleDateString()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Amount */}
				<div className="space-y-2">
					<Label htmlFor="amount">Amount *</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						min="0"
						placeholder="0.00"
						disabled={loading}
						required
					/>
				</div>

				{/* Payment Mode */}
				<div className="space-y-2">
					<Label htmlFor="paymentMode">Payment Mode *</Label>
					<Select name="paymentMode" disabled={loading} required>
						<SelectTrigger>
							<SelectValue placeholder="Select payment mode" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="CASH">Cash</SelectItem>
							<SelectItem value="ONLINE">Online</SelectItem>
							<SelectItem value="UPI">UPI</SelectItem>
							<SelectItem value="CARD">Card</SelectItem>
							<SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Notes */}
			<div className="space-y-2">
				<Label htmlFor="notes">Notes (Optional)</Label>
				<Textarea
					id="notes"
					name="notes"
					placeholder="Payment notes"
					disabled={loading}
					rows={3}
				/>
			</div>

			{/* Submit */}
			<div className="flex gap-4">
				<Button
					type="submit"
					disabled={loading}
					className="bg-green-600 hover:bg-green-700"
				>
					{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
					Record Payment
				</Button>
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
