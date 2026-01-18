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
import { formatCurrency } from "@/lib/utils/format";

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
			finalAmount: number;
		}>;
		payments?: Array<{
			amount: number;
			discount?: number | null;
			gstAmount?: number | null;
		}>;
	}>;
	initialMemberId?: string;
}

export default function PaymentForm({
	members,
	initialMemberId,
}: PaymentFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedMember, setSelectedMember] = useState<string>(
		initialMemberId || ""
	);
	const [amount, setAmount] = useState<string>("");
	const [discount, setDiscount] = useState<string>("");
	const [gstPercentage, setGstPercentage] = useState<string>("");

	const baseAmount = parseFloat(amount) || 0;
	const discountAmount = parseFloat(discount) || 0;
	const amountAfterDiscount = Math.max(0, baseAmount - discountAmount);
	const gstRate = parseFloat(gstPercentage) || 0;
	const gstAmount =
		amountAfterDiscount > 0 && gstRate > 0
			? (amountAfterDiscount * gstRate) / 100
			: 0;
	const totalAmount = amountAfterDiscount + gstAmount;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		
		// Validate discount and payment against remaining base due
		if (remainingBaseDue !== null) {
			const base = parseFloat(formData.get("amount") as string) || 0;
			const disc = parseFloat(formData.get("discount") as string) || 0;
			const afterDiscount = Math.max(0, base - disc);
			
			// Rule 2: Discount validation (human-friendly errors)
			if (disc < 0) {
				toast.error("Discount cannot be negative");
				setLoading(false);
				return;
			}
			
			if (disc > remainingBaseDue) {
				toast.error(
					`Discount cannot exceed remaining base fee of ₹${remainingBaseDue.toFixed(2)}`
				);
				setLoading(false);
				return;
			}
			
			// Rule 6: Validate settlement (never compare GST with Due)
			// payment_ex_gst <= base_due - discount
			if (afterDiscount + disc > remainingBaseDue) {
				toast.error(
					`Payment amount (₹${afterDiscount.toFixed(2)}) plus discount (₹${disc.toFixed(2)}) exceeds remaining base fee (₹${remainingBaseDue.toFixed(2)})`
				);
				setLoading(false);
				return;
			}
		}
		
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
			discount: formData.get("discount")
				? parseFloat(formData.get("discount") as string)
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
	const activeMembership = selectedMemberData?.memberships.find(
		(m) => m.active
	);

	// Calculate remaining balance (base amounts only, excluding GST)
	const baseDue = activeMembership ? Number(activeMembership.finalAmount) : 0;
	
	const totalDiscounts =
		selectedMemberData?.payments?.reduce(
			(sum, p) => sum + Number(p.discount || 0),
			0
		) || 0;
	
	// Calculate payments excluding GST (GST doesn't reduce base due)
	const totalPaymentsExcludingGST =
		selectedMemberData?.payments?.reduce(
			(sum, p) => {
				const paymentAmount = Number(p.amount);
				const gstAmount = Number(p.gstAmount || 0);
				return sum + (paymentAmount - gstAmount);
			},
			0
		) || 0;
	
	// Remaining base due = Base Due - Discounts - Payments (excluding GST)
	const remainingBaseDue = activeMembership
		? baseDue - totalDiscounts - totalPaymentsExcludingGST
		: null;

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
						onChange={(e) => {
							const value = e.target.value;
							setAmount(value);
							
							// Validate against remaining base due (excluding GST)
							if (remainingBaseDue !== null && value) {
								const base = parseFloat(value) || 0;
								const disc = parseFloat(discount) || 0;
								const afterDiscount = Math.max(0, base - disc);
								
								// Validate discount
								if (disc > remainingBaseDue) {
									toast.error(
										`Discount cannot exceed remaining base due of ${formatCurrency(remainingBaseDue)}`
									);
									return;
								}
								
								// Validate settlement
								if (afterDiscount + disc > remainingBaseDue) {
									toast.error(
										`Settlement (Base: ₹${afterDiscount.toFixed(2)} + Discount: ₹${disc.toFixed(2)}) exceeds remaining base due of ${formatCurrency(remainingBaseDue)}`
									);
									return;
								}
							}
						}}
						disabled={loading}
						required
					/>
					{remainingBaseDue !== null && (
						<div className="text-xs text-muted-foreground space-y-1">
							<p>
								Remaining base due:{" "}
								<span
									className={
										remainingBaseDue > 0 ? "font-semibold text-orange-600" : "font-semibold text-green-600"
									}
								>
									{remainingBaseDue > 0 ? formatCurrency(remainingBaseDue) : "No Dues"}
								</span>
							</p>
							{totalDiscounts > 0 && (
								<p>
									Total discounts given:{" "}
									<span className="font-semibold text-blue-600">
										{formatCurrency(totalDiscounts)}
									</span>
								</p>
							)}
							<p className="text-xs italic text-muted-foreground">
								Golden Formula: Discount reduces Base → GST applies after Discount → Payment settles Taxable + GST
							</p>
						</div>
					)}
				</div>

				{/* Discount */}
				<div className="space-y-2">
					<Label htmlFor="discount">Discount (Optional)</Label>
					<Input
						id="discount"
						name="discount"
						type="number"
						step="0.01"
						min="0"
						max={remainingBaseDue !== null ? remainingBaseDue : undefined}
						placeholder="0.00"
						value={discount}
						onChange={(e) => {
							const value = e.target.value;
							setDiscount(value);
							
							// Validate discount doesn't exceed remaining base due
							if (remainingBaseDue !== null && value) {
								const disc = parseFloat(value) || 0;
								const base = parseFloat(amount) || 0;
								const afterDiscount = Math.max(0, base - disc);
								
								if (disc > remainingBaseDue) {
									toast.error(
										`Discount cannot exceed remaining base due of ${formatCurrency(remainingBaseDue)}`
									);
									return;
								}
								
								// Validate total settlement
								if (afterDiscount + disc > remainingBaseDue) {
									toast.error(
										`Settlement (Base: ₹${afterDiscount.toFixed(2)} + Discount: ₹${disc.toFixed(2)}) exceeds remaining base due of ${formatCurrency(remainingBaseDue)}`
									);
									return;
								}
							}
						}}
						disabled={loading}
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

				{/* Price Breakdown */}
				{(discountAmount > 0 || gstAmount > 0) && (
					<div className="space-y-2 p-4 bg-gray-50 rounded-lg col-span-2">
						<h4 className="font-medium text-sm">Price Breakdown</h4>
						<div className="space-y-1 text-sm">
							<div className="flex justify-between">
								<span>Base Amount:</span>
								<span>₹{baseAmount.toFixed(2)}</span>
							</div>
							{discountAmount > 0 && (
								<div className="flex justify-between text-green-600">
									<span>Discount:</span>
									<span>-₹{discountAmount.toFixed(2)}</span>
								</div>
							)}
							{discountAmount > 0 && (
								<div className="flex justify-between text-muted-foreground">
									<span>Base After Discount:</span>
									<span>₹{amountAfterDiscount.toFixed(2)}</span>
								</div>
							)}
							{gstAmount > 0 && (
								<div className="flex justify-between">
									<span>GST ({gstRate}% on base after discount):</span>
									<span>₹{gstAmount.toFixed(2)}</span>
								</div>
							)}
							<div className="flex justify-between font-semibold border-t pt-1">
								<span>Final Payable:</span>
								<span>₹{totalAmount.toFixed(2)}</span>
							</div>
							{remainingBaseDue !== null && (
								<div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
									<span>Remaining base due after this payment:</span>
									<span className={remainingBaseDue - amountAfterDiscount - discountAmount > 0 ? "text-orange-600" : "text-green-600"}>
										₹{Math.max(0, (remainingBaseDue - amountAfterDiscount - discountAmount)).toFixed(2)}
									</span>
								</div>
							)}
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
