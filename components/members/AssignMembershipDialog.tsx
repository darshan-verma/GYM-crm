"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { assignMembership } from "@/lib/actions/memberships";
import { getMembershipPlans } from "@/lib/actions/memberships";
import { formatCurrency } from "@/lib/utils/format";
import { useFormDraft } from "@/lib/hooks/useFormDraft";
import { DRAFT_KEYS } from "@/lib/utils/draft";

interface AssignMembershipDraft {
	selectedPlan?: string;
	startDate?: string;
	discount?: string;
	discountType?: "PERCENTAGE" | "FIXED";
	notes?: string;
}

interface AssignMembershipDialogProps {
	memberId: string;
	open: boolean;
	onClose: () => void;
}

export default function AssignMembershipDialog({
	memberId,
	open,
	onClose,
}: AssignMembershipDialogProps) {
	const router = useRouter();
	const draftKey = DRAFT_KEYS.ASSIGN_MEMBERSHIP(memberId);
	const { draft, saveDraft, clearDraft } = useFormDraft<AssignMembershipDraft>(
		draftKey,
		{ enabled: open, debounceMs: 600 }
	);
	const draftApplied = useRef(false);
	const skipFirstSave = useRef(true);
	const [loading, setLoading] = useState(false);
	const [plans, setPlans] = useState<
		{ id: string; name: string; price: number; duration: number }[]
	>([]);
	const [selectedPlan, setSelectedPlan] = useState<string>("");
	const [startDate, setStartDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [discount, setDiscount] = useState("");
	const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
		"FIXED"
	);
	const [notes, setNotes] = useState("");

	useEffect(() => {
		if (open) {
			getMembershipPlans().then(setPlans);
		}
	}, [open]);

	// Reset draft-applied and skip-first-save when dialog opens/closes or memberId changes
	useEffect(() => {
		if (!open) {
			draftApplied.current = false;
		} else {
			skipFirstSave.current = true;
		}
	}, [open, memberId]);

	// Apply draft when dialog opens and draft exists
	useEffect(() => {
		if (open && draft && !draftApplied.current) {
			draftApplied.current = true;
			if (draft.selectedPlan) setSelectedPlan(draft.selectedPlan);
			if (draft.startDate) setStartDate(draft.startDate);
			if (draft.discount != null) setDiscount(draft.discount);
			if (draft.discountType) setDiscountType(draft.discountType);
			if (draft.notes != null) setNotes(draft.notes);
			toast.info("Draft restored");
		}
	}, [open, draft]);

	// Save draft when form state changes (only when open; skip first run to avoid overwriting stored draft)
	useEffect(() => {
		if (!open) return;
		if (skipFirstSave.current) {
			skipFirstSave.current = false;
			return;
		}
		saveDraft({
			selectedPlan,
			startDate,
			discount,
			discountType,
			notes,
		});
	}, [open, selectedPlan, startDate, discount, discountType, notes, saveDraft]);

	const selectedPlanData = plans.find((p) => p.id === selectedPlan);

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
			const result = await assignMembership({
				memberId,
				planId: selectedPlan,
				startDate: new Date(startDate),
				discount: discount ? parseFloat(discount) : undefined,
				discountType: discount ? discountType : undefined,
				notes: notes || undefined,
			});

			if (result.success) {
				clearDraft();
				toast.success("Membership assigned successfully");
				onClose();
				router.refresh();
			} else {
				toast.error(result.error || "Failed to assign membership");
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
					<DialogTitle>Assign Membership</DialogTitle>
					<DialogDescription>
						Select a membership plan and configure the details
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Plan Selection */}
					<div className="space-y-2">
						<Label>Membership Plan *</Label>
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
							onClick={() => {
								clearDraft();
								onClose();
							}}
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
									Assigning...
								</>
							) : (
								"Assign Membership"
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
