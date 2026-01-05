"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { updateMembership } from "@/lib/actions/memberships";
import { getMembershipPlans } from "@/lib/actions/memberships";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface EditMembershipDialogProps {
	membership: {
		id: string;
		memberId: string;
		planId: string;
		startDate: Date | string;
		endDate: Date | string;
		amount: number;
		discount?: number;
		discountType?: string;
		finalAmount: number;
		notes?: string;
		plan: {
			id: string;
			name: string;
			price: number;
			duration: number;
		};
	};
	open: boolean;
	onClose: () => void;
}

export default function EditMembershipDialog({
	membership,
	open,
	onClose,
}: EditMembershipDialogProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [plans, setPlans] = useState<
		{ id: string; name: string; price: number; duration: number }[]
	>([]);
	const [selectedPlan, setSelectedPlan] = useState<string>(membership.planId);
	const [startDate, setStartDate] = useState(
		new Date(membership.startDate).toISOString().split("T")[0]
	);
	const [discount, setDiscount] = useState(
		membership.discount?.toString() || ""
	);
	const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
		(membership.discountType as "PERCENTAGE" | "FIXED") || "FIXED"
	);
	const [notes, setNotes] = useState(membership.notes || "");

	useEffect(() => {
		if (open) {
			getMembershipPlans().then(setPlans);
		}
	}, [open]);

	const selectedPlanData = plans.find((p) => p.id === selectedPlan);
	const currentPlan = membership.plan;

	let finalAmount = selectedPlanData ? Number(selectedPlanData.price) : 0;
	if (discount && selectedPlanData) {
		const discountValue = parseFloat(discount);
		if (discountType === "PERCENTAGE") {
			finalAmount = finalAmount - (finalAmount * discountValue) / 100;
		} else {
			finalAmount = finalAmount - discountValue;
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!selectedPlan) {
			toast.error("Please select a membership plan");
			return;
		}

		setLoading(true);

		try {
			const result = await updateMembership(membership.id, {
				planId: selectedPlan,
				startDate: new Date(startDate),
				discount: discount ? parseFloat(discount) : undefined,
				discountType: discount ? discountType : undefined,
				notes: notes || undefined,
			});

			if (result.success) {
				toast.success("Membership updated successfully");
				onClose();
				router.refresh();
			} else {
				toast.error(result.error || "Failed to update membership");
			}
		} catch (_error) {
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Membership</DialogTitle>
					<DialogDescription>
						Update the membership plan and other details
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Current Plan Info */}
					<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
						<div className="flex items-center gap-2">
							<Info className="w-4 h-4 text-blue-600" />
							<span className="text-sm font-medium text-blue-900">
								Current Plan
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-blue-700">{currentPlan.name}</span>
							<Badge variant="outline" className="bg-white">
								{formatCurrency(Number(currentPlan.price))}
							</Badge>
						</div>
						<p className="text-xs text-blue-600">
							{currentPlan.duration} days duration
						</p>
					</div>

					{/* Plan Selection */}
					<div className="space-y-2">
						<Label>Select New Plan *</Label>
						<Select
							value={selectedPlan}
							onValueChange={setSelectedPlan}
							required
						>
							<SelectTrigger>
								<SelectValue placeholder="Select a plan" />
							</SelectTrigger>
							<SelectContent>
								{plans.map((plan) => (
									<SelectItem key={plan.id} value={plan.id}>
										{plan.name} - {formatCurrency(Number(plan.price))} (
										{plan.duration} days)
										{plan.id === currentPlan.id && " (Current)"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Start Date */}
					<div className="space-y-2">
						<Label>Start Date *</Label>
						<Input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							required
						/>
					</div>

					{/* Discount */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label>Discount</Label>
							<Input
								type="number"
								step="0.01"
								min="0"
								value={discount}
								onChange={(e) => setDiscount(e.target.value)}
								placeholder="0"
							/>
						</div>
						<div className="space-y-2">
							<Label>Type</Label>
							<Select
								value={discountType}
								onValueChange={(value) =>
									setDiscountType(value as "PERCENTAGE" | "FIXED")
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="FIXED">Fixed Amount</SelectItem>
									<SelectItem value="PERCENTAGE">Percentage</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Price Summary */}
					{selectedPlanData && (
						<div className="p-4 bg-muted rounded-lg space-y-2">
							<div className="flex justify-between text-sm">
								<span>Plan Price:</span>
								<span>{formatCurrency(Number(selectedPlanData.price))}</span>
							</div>
							{discount && (
								<div className="flex justify-between text-sm text-muted-foreground">
									<span>Discount:</span>
									<span>
										-
										{discountType === "PERCENTAGE"
											? `${discount}%`
											: formatCurrency(parseFloat(discount))}
									</span>
								</div>
							)}
							<div className="flex justify-between font-bold text-lg pt-2 border-t">
								<span>Final Amount:</span>
								<span className="text-green-600">
									{formatCurrency(finalAmount)}
								</span>
							</div>
						</div>
					)}

					{/* Notes */}
					<div className="space-y-2">
						<Label>Notes</Label>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							placeholder="Any additional notes..."
						/>
					</div>

					{/* Actions */}
					<div className="flex gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={loading}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading || !selectedPlan}
							className="flex-1"
						>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Updating...
								</>
							) : (
								"Update Membership"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
