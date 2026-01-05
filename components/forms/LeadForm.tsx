"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLead, updateLead } from "@/lib/actions/leads";
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
import { LeadSource } from "@prisma/client";

interface Lead {
	id: string;
	name: string;
	email: string | null;
	phone: string;
	source: LeadSource;
	followUpDate: Date | null;
	notes: string | null;
	status: string;
	interestedPlan?: string | null;
	budget?: number | null;
	age?: number | null;
	gender?: string | null;
	convertedDate?: Date | null;
	lastContactDate?: Date | null;
	assignedTo?: string | null;
	priority?: string | null;
}

interface LeadFormProps {
	isEdit?: boolean;
	initialData?: Lead;
}

export default function LeadForm({
	isEdit = false,
	initialData,
}: LeadFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name") as string,
			phone: formData.get("phone") as string,
			email: (formData.get("email") as string) || undefined,
			source: formData.get("source") as LeadSource,
			interestedPlan: (formData.get("interestedPlan") as string) || undefined,
			notes: (formData.get("notes") as string) || undefined,
			followUpDate: formData.get("followUpDate")
				? new Date(formData.get("followUpDate") as string)
				: undefined,
		};

		try {
			const result =
				isEdit && initialData
					? await updateLead(initialData.id, data)
					: await createLead(data);

			if (result.success) {
				toast.success(
					isEdit ? "Lead updated successfully" : "Lead created successfully"
				);
				router.push(
					isEdit && initialData ? `/leads/${initialData.id}` : "/leads"
				);
				router.refresh();
			} else {
				toast.error(result.error || "Failed to save lead");
			}
		} catch (_error) {
			toast.error("Failed to save lead");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2">
				{/* Name */}
				<div className="space-y-2">
					<Label htmlFor="name">Full Name *</Label>
					<Input
						id="name"
						name="name"
						placeholder="Enter lead's full name"
						defaultValue={initialData?.name}
						disabled={loading}
						required
					/>
				</div>

				{/* Phone */}
				<div className="space-y-2">
					<Label htmlFor="phone">Phone *</Label>
					<Input
						id="phone"
						name="phone"
						placeholder="Enter phone number"
						defaultValue={initialData?.phone}
						disabled={loading}
						required
					/>
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="email">Email (Optional)</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Enter email address"
						defaultValue={initialData?.email || undefined}
						disabled={loading}
					/>
				</div>

				{/* Source */}
				<div className="space-y-2">
					<Label htmlFor="source">Lead Source *</Label>
					<Select
						name="source"
						defaultValue={initialData?.source}
						disabled={loading}
						required
					>
						<SelectTrigger>
							<SelectValue placeholder="Select lead source" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="WALK_IN">Walk-in</SelectItem>
							<SelectItem value="PHONE_CALL">Phone Call</SelectItem>
							<SelectItem value="WEBSITE">Website</SelectItem>
							<SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
							<SelectItem value="REFERRAL">Referral</SelectItem>
							<SelectItem value="OTHER">Other</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Interested Plan */}
				<div className="space-y-2">
					<Label htmlFor="interestedPlan">Interested Plan (Optional)</Label>
					<Input
						id="interestedPlan"
						name="interestedPlan"
						placeholder="e.g., 3 Month Plan, Personal Training"
						defaultValue={initialData?.interestedPlan || undefined}
						disabled={loading}
					/>
				</div>

				{/* Follow Up Date */}
				<div className="space-y-2">
					<Label htmlFor="followUpDate">Follow Up Date (Optional)</Label>
					<Input
						id="followUpDate"
						name="followUpDate"
						type="date"
						defaultValue={
							initialData?.followUpDate
								? new Date(initialData.followUpDate).toISOString().split("T")[0]
								: ""
						}
						disabled={loading}
					/>
				</div>
			</div>

			{/* Notes */}
			<div className="space-y-2">
				<Label htmlFor="notes">Notes (Optional)</Label>
				<Textarea
					id="notes"
					name="notes"
					placeholder="Additional notes about the lead"
					defaultValue={initialData?.notes || undefined}
					disabled={loading}
					rows={3}
				/>
			</div>

			{/* Submit */}
			<div className="flex gap-4">
				<Button type="submit" disabled={loading}>
					{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
					{isEdit ? "Update Lead" : "Create Lead"}
				</Button>
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
