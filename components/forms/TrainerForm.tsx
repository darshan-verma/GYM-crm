"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrainer, updateTrainer } from "@/lib/actions/trainers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface Trainer {
	id: string;
	name: string;
	email: string;
	phone: string;
	specialization: string;
	experience: number;
	bio: string;
}

interface TrainerFormProps {
	isEdit?: boolean;
	initialData?: Trainer;
}

export default function TrainerForm({
	isEdit = false,
	initialData,
}: TrainerFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget);

		try {
			let result;

			if (isEdit && initialData) {
				// Update trainer
				const updateData = {
					name: (formData.get("name") as string) || undefined,
					email: (formData.get("email") as string) || undefined,
					phone: (formData.get("phone") as string) || undefined,
				};
				result = await updateTrainer(initialData.id, updateData);
			} else {
				// Create trainer
				const createData = {
					name: formData.get("name") as string,
					email: formData.get("email") as string,
					password: formData.get("password") as string,
					phone: (formData.get("phone") as string) || undefined,
				};
				result = await createTrainer(createData);
			}

			if (result.success) {
				toast.success(
					isEdit
						? "Trainer updated successfully"
						: "Trainer created successfully"
				);
				router.push(isEdit ? `/trainers/${initialData!.id}` : "/trainers");
				router.refresh();
			} else {
				toast.error(
					result.error || `Failed to ${isEdit ? "update" : "create"} trainer`
				);
			}
		} catch (_error) {
			toast.error(`Failed to ${isEdit ? "update" : "create"} trainer`);
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
						placeholder="Enter trainer's full name"
						defaultValue={initialData?.name}
						disabled={loading}
						required
					/>
				</div>

				{/* Email */}
				<div className="space-y-2">
					<Label htmlFor="email">Email *</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Enter email address"
						defaultValue={initialData?.email}
						disabled={loading}
						required
					/>
				</div>

				{/* Phone */}
				<div className="space-y-2">
					<Label htmlFor="phone">Phone (Optional)</Label>
					<Input
						id="phone"
						name="phone"
						placeholder="Enter phone number"
						defaultValue={initialData?.phone}
						disabled={loading}
					/>
				</div>

				{/* Password - only show when creating */}
				{!isEdit && (
					<div className="space-y-2">
						<Label htmlFor="password">Password *</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Enter password"
							disabled={loading}
							required
							minLength={6}
						/>
					</div>
				)}
			</div>

			{/* Submit */}
			<div className="flex gap-4">
				<Button type="submit" disabled={loading}>
					{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
					{isEdit ? "Update Trainer" : "Create Trainer"}
				</Button>
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
			</div>
		</form>
	);
}
