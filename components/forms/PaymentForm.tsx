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
	const [amount, setAmount] = useState<string>("");
	const [gstPercentage, setGstPercentage] = useState<string>("");

	const baseAmount = parseFloat(amount) || 0;
	const gstRate = parseFloat(gstPercentage) || 0;
	const gstAmount =
		baseAmount > 0 && gstRate > 0 ? (baseAmount * gstRate) / 100 : 0;
	const totalAmount = baseAmount + gstAmount;

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
			gstNumber: (formData.get("gstNumber") as string) || undefined,
			gstPercentage: formData.get("gstPercentage")
				? parseFloat(formData.get("gstPercentage") as string)
				: undefined,
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
					<Label htmlFor="amount">Base Amount (excluding GST) *</Label>
					<Input
						id="amount"
						name="amount"
						type="number"
						step="0.01"
						min="0"
						placeholder="0.00"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
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

				{/* GST Number */}
				<div className="space-y-2">
					<Label htmlFor="gstNumber">GST Number (Optional)</Label>
					<Input
						id="gstNumber"
						name="gstNumber"
						type="text"
						placeholder="22AAAAA0000A1Z5"
						disabled={loading}
					/>
				</div>

				{/* GST Percentage */}
				<div className="space-y-2">
					<Label htmlFor="gstPercentage">GST Percentage (Optional)</Label>
					<Input
						id="gstPercentage"
						name="gstPercentage"
						type="number"
						step="0.01"
						min="0"
						max="100"
						placeholder="18.00"
						value={gstPercentage}
						onChange={(e) => setGstPercentage(e.target.value)}
						disabled={loading}
					/>
				</div>

				{/* GST Calculation Display */}
				{gstAmount > 0 && (
					<div className="space-y-2 p-4 bg-gray-50 rounded-lg col-span-2">
						<h4 className="font-medium text-sm">GST Calculation</h4>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Base Amount:</span>
								<span>₹{baseAmount.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span>GST ({gstRate}%):</span>
								<span>₹{gstAmount.toFixed(2)}</span>
							</div>
							<div className="flex justify-between font-semibold border-t pt-1">
								<span>Total Amount:</span>
								<span>₹{totalAmount.toFixed(2)}</span>
							</div>
						</div>
					</div>
				)}
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
