"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createMember, updateMember } from "@/lib/actions/members";
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
import LocationPicker from "./LocationPicker";

const PHOTO_DRAFT_MAX_BYTES = 200 * 1024;

export interface MemberFormDraft {
	name?: string;
	phone?: string;
	email?: string;
	dateOfBirth?: string;
	gender?: string;
	bloodGroup?: string;
	address?: string;
	city?: string;
	state?: string;
	pincode?: string;
	medicalConditions?: string;
	emergencyName?: string;
	emergencyContact?: string;
	trainerId?: string;
	membershipPlanId?: string;
	notes?: string;
	photoPreview?: string;
	locationData?: {
		address: string;
		formattedAddress: string;
		latitude: number;
		longitude: number;
		city?: string;
		state?: string;
		pincode?: string;
	} | null;
}

export interface Member {
	id: string;
	name: string;
	email: string;
	phone: string;
	dateOfBirth: Date | null;
	gender: string;
	address: string;
	city?: string;
	state?: string;
	pincode?: string;
	latitude?: number | null;
	longitude?: number | null;
	formattedAddress?: string | null;
	bloodGroup?: string;
	medicalConditions?: string;
	emergencyName?: string;
	emergencyContact: string;
	emergencyPhone: string;
	membershipNumber: string;
	trainerId: string | null;
	membershipPlanId?: string;
	photo?: string;
	notes?: string;
	status: string;
	joiningDate: Date;
}

interface MemberFormProps {
	trainers: Array<{ id: string; name: string }>;
	membershipPlans?: Array<{
		id: string;
		name: string;
		price: number;
		duration: number;
	}>;
	initialData?: Member;
	isEdit?: boolean;
	leadId?: string;
	leadData?: {
		name?: string;
		phone?: string;
		email?: string;
	};
	initialFromDraft?: MemberFormDraft | null;
	onSaveDraft?: (data: MemberFormDraft) => void;
	onClearDraft?: () => void;
}

function getInitialValues(
	initialData?: Member,
	leadData?: { name?: string; phone?: string; email?: string },
	draft?: MemberFormDraft | null
) {
	if (draft) {
		return {
			name: draft.name ?? leadData?.name ?? "",
			phone: draft.phone ?? leadData?.phone ?? "",
			email: draft.email ?? leadData?.email ?? "",
			dateOfBirth: draft.dateOfBirth ?? "",
			gender: draft.gender ?? "",
			bloodGroup: draft.bloodGroup ?? "",
			address: draft.address ?? "",
			city: draft.city ?? "",
			state: draft.state ?? "",
			pincode: draft.pincode ?? "",
			medicalConditions: draft.medicalConditions ?? "",
			emergencyName: draft.emergencyName ?? "",
			emergencyContact: draft.emergencyContact ?? "",
			trainerId: draft.trainerId ?? "none",
			membershipPlanId: draft.membershipPlanId ?? "",
			notes: draft.notes ?? "",
			photoPreview: draft.photoPreview ?? "",
			locationData: draft.locationData ?? null,
		};
	}
	if (initialData) {
		return {
			name: initialData.name,
			phone: initialData.phone,
			email: initialData.email ?? "",
			dateOfBirth: initialData.dateOfBirth
				? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
				: "",
			gender: initialData.gender ?? "",
			bloodGroup: initialData.bloodGroup ?? "",
			address: initialData.address ?? "",
			city: initialData.city ?? "",
			state: initialData.state ?? "",
			pincode: initialData.pincode ?? "",
			medicalConditions: initialData.medicalConditions ?? "",
			emergencyName: initialData.emergencyName ?? "",
			emergencyContact: initialData.emergencyContact ?? "",
			trainerId: initialData.trainerId ?? "none",
			membershipPlanId: initialData.membershipPlanId ?? "",
			notes: initialData.notes ?? "",
			photoPreview: initialData.photo ?? "",
			locationData:
				initialData?.latitude != null && initialData?.longitude != null
					? {
							address: initialData.formattedAddress || initialData.address || "",
							formattedAddress: initialData.formattedAddress || initialData.address || "",
							latitude: initialData.latitude,
							longitude: initialData.longitude,
							city: initialData.city,
							state: initialData.state,
							pincode: initialData.pincode,
					  }
					: null,
		};
	}
	return {
		name: leadData?.name ?? "",
		phone: leadData?.phone ?? "",
		email: leadData?.email ?? "",
		dateOfBirth: "",
		gender: "",
		bloodGroup: "",
		address: "",
		city: "",
		state: "",
		pincode: "",
		medicalConditions: "",
		emergencyName: "",
		emergencyContact: "",
		trainerId: "none",
		membershipPlanId: "",
		notes: "",
		photoPreview: "",
		locationData: null as {
			address: string;
			formattedAddress: string;
			latitude: number;
			longitude: number;
			city?: string;
			state?: string;
			pincode?: string;
		} | null,
	};
}

export default function MemberForm({
	trainers,
	membershipPlans = [],
	initialData,
	isEdit = false,
	leadId,
	leadData,
	initialFromDraft,
	onSaveDraft,
	onClearDraft,
}: MemberFormProps) {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);
	const initial = getInitialValues(initialData, leadData, initialFromDraft);
	const [loading, setLoading] = useState(false);
	const [selectedMembershipPlan, setSelectedMembershipPlan] = useState<string>(
		isEdit && initialData?.membershipPlanId ? initialData.membershipPlanId : initial.membershipPlanId
	);
	const [photoPreview, setPhotoPreview] = useState(initial.photoPreview);
	const [locationData, setLocationData] = useState<{
		address: string;
		formattedAddress: string;
		latitude: number;
		longitude: number;
		city?: string;
		state?: string;
		pincode?: string;
	} | null>(initial.locationData);

	// Restore draft toast (once)
	const [draftRestored, setDraftRestored] = useState(false);
	useEffect(() => {
		if (initialFromDraft && !draftRestored && !isEdit) {
			toast.info("Draft restored");
			setDraftRestored(true);
		}
	}, [initialFromDraft, draftRestored, isEdit]);

	// Debounced draft save when form changes
	const saveDraftFromForm = useCallback(() => {
		if (!formRef.current || !onSaveDraft || isEdit) return;
		const form = formRef.current;
		const fd = new FormData(form);
		const photo =
			typeof photoPreview === "string" && photoPreview.length > 0 && photoPreview.length < PHOTO_DRAFT_MAX_BYTES
				? photoPreview
				: undefined;
		onSaveDraft({
			name: (fd.get("name") as string) ?? "",
			phone: (fd.get("phone") as string) ?? "",
			email: (fd.get("email") as string) ?? "",
			dateOfBirth: (fd.get("dateOfBirth") as string) ?? "",
			gender: (fd.get("gender") as string) ?? "",
			bloodGroup: (fd.get("bloodGroup") as string) ?? "",
			address: (fd.get("address") as string) ?? "",
			city: (fd.get("city") as string) ?? "",
			state: (fd.get("state") as string) ?? "",
			pincode: (fd.get("pincode") as string) ?? "",
			medicalConditions: (fd.get("medicalConditions") as string) ?? "",
			emergencyName: (fd.get("emergencyName") as string) ?? "",
			emergencyContact: (fd.get("emergencyContact") as string) ?? "",
			trainerId: (fd.get("trainerId") as string) ?? "none",
			membershipPlanId: selectedMembershipPlan || "",
			notes: (fd.get("notes") as string) ?? "",
			photoPreview: photo,
			locationData,
		});
	}, [
		selectedMembershipPlan,
		photoPreview,
		locationData,
		onSaveDraft,
		isEdit,
	]);

	useEffect(() => {
		if (!onSaveDraft || isEdit) return;
		const form = formRef.current;
		if (!form) return;
		const handleChange = () => {
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
			saveTimeoutRef.current = setTimeout(saveDraftFromForm, 600);
		};
		const saveTimeoutRef = { current: null as ReturnType<typeof setTimeout> | null };
		form.addEventListener("input", handleChange);
		form.addEventListener("change", handleChange);
		return () => {
			form.removeEventListener("input", handleChange);
			form.removeEventListener("change", handleChange);
			if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		};
	}, [onSaveDraft, isEdit, saveDraftFromForm]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		
		// Validate membership BEFORE setting loading state
		if (!selectedMembershipPlan || selectedMembershipPlan.trim() === "" || selectedMembershipPlan === "none") {
			toast.error("Please select a membership plan. Membership is required to create a member.");
			return;
		}
		
		// Verify the selected plan exists
		const planExists = membershipPlans.some(plan => plan.id === selectedMembershipPlan);
		if (!planExists) {
			toast.error("Please select a valid membership plan from the list.");
			return;
		}
		
		// Validate address BEFORE setting loading state
		const formData = new FormData(e.currentTarget);
		const address = formData.get("address") as string;
		const formattedAddress = locationData?.formattedAddress || address;
		if (!address && !formattedAddress) {
			toast.error("Address is required. Please enter an address or select a location on the map.");
			return;
		}
		
		setLoading(true);
		
		// If address is empty but formattedAddress exists, use formattedAddress
		if (!address && formattedAddress) {
			formData.set("address", formattedAddress);
		}

		// Set membership plan ID from state (already validated above)
		formData.set("membershipPlanId", selectedMembershipPlan);

		// Handle special values
		if (formData.get("trainerId") === "none") {
			formData.set("trainerId", "");
		}
		if (formData.get("membershipPlanId") === "none") {
			formData.set("membershipPlanId", "");
		}

		// Handle location data
		if (locationData) {
			formData.set("latitude", locationData.latitude.toString());
			formData.set("longitude", locationData.longitude.toString());
			formData.set("formattedAddress", locationData.formattedAddress);
			// Update city, state, pincode if provided by location picker
			if (locationData.city) {
				formData.set("city", locationData.city);
			}
			if (locationData.state) {
				formData.set("state", locationData.state);
			}
			if (locationData.pincode) {
				formData.set("pincode", locationData.pincode);
			}
		} else {
			// Clear location fields if location is cleared
			formData.set("latitude", "");
			formData.set("longitude", "");
			formData.set("formattedAddress", "");
		}

		try {
			const result = isEdit
				? await updateMember(initialData!.id, formData)
				: await createMember(formData);

			if (result.success && result.data) {
				if (!isEdit) onClearDraft?.();
				toast.success(
					isEdit ? "Member updated successfully" : "Member created successfully"
				);
				router.push(`/members/${result.data.id}`);
				router.refresh();
			} else {
				toast.error(result.error || "Something went wrong");
			}
		} catch (_error) {
			toast.error("Failed to save member");
		} finally {
			setLoading(false);
		}
	}

	function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	}

	return (
		<form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
			{leadId ? <input type="hidden" name="leadId" value={leadId} /> : null}
			{/* Photo Upload */}
			<div className="space-y-2">
				<Label>Profile Photo</Label>
				<div className="flex items-center gap-4">
					{photoPreview && (
						<Image
							src={photoPreview}
							alt="Preview"
							width={80}
							height={80}
							className="w-20 h-20 rounded-full object-cover border-2"
						/>
					)}
					<div className="flex-1">
						<Input
							type="file"
							name="photo"
							accept="image/*"
							onChange={handlePhotoChange}
							disabled={loading}
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Upload a profile photo (optional)
						</p>
					</div>
				</div>
			</div>

			{/* Personal Details */}
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="name">Full Name *</Label>
					<Input
						id="name"
						name="name"
						defaultValue={initial.name}
						required
						disabled={loading}
						placeholder="John Doe"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="phone">Phone Number *</Label>
					<Input
						id="phone"
						name="phone"
						type="tel"
						defaultValue={initial.phone}
						required
						disabled={loading}
						placeholder="+91 9876543210"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						defaultValue={initial.email}
						disabled={loading}
						placeholder="john@example.com"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dateOfBirth">Date of Birth</Label>
					<Input
						id="dateOfBirth"
						name="dateOfBirth"
						type="date"
						defaultValue={initial.dateOfBirth}
						disabled={loading}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="gender">Gender</Label>
					<Select
						name="gender"
						defaultValue={initial.gender}
						disabled={loading}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select gender" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Male">Male</SelectItem>
							<SelectItem value="Female">Female</SelectItem>
							<SelectItem value="Other">Other</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="bloodGroup">Blood Group</Label>
					<Select
						name="bloodGroup"
						defaultValue={initial.bloodGroup}
						disabled={loading}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select blood group" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="A+">A+</SelectItem>
							<SelectItem value="A-">A-</SelectItem>
							<SelectItem value="B+">B+</SelectItem>
							<SelectItem value="B-">B-</SelectItem>
							<SelectItem value="AB+">AB+</SelectItem>
							<SelectItem value="AB-">AB-</SelectItem>
							<SelectItem value="O+">O+</SelectItem>
							<SelectItem value="O-">O-</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Address */}
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="address">Address *</Label>
					<Input
						id="address"
						name="address"
						defaultValue={initial.address}
						disabled={loading}
						placeholder="Street address or select location on map"
					/>
					<p className="text-xs text-muted-foreground mt-1">
						Enter address manually or use the location picker below
					</p>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<div className="space-y-2">
						<Label htmlFor="city">City</Label>
						<Input
							id="city"
							name="city"
							defaultValue={initial.city}
							disabled={loading}
							placeholder="City"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="state">State</Label>
						<Input
							id="state"
							name="state"
							defaultValue={initial.state}
							disabled={loading}
							placeholder="State"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="pincode">Pincode</Label>
						<Input
							id="pincode"
							name="pincode"
							defaultValue={initial.pincode}
							disabled={loading}
							placeholder="400001"
						/>
					</div>
				</div>

				{/* Location Picker with Google Maps */}
				<LocationPicker
					onLocationChange={setLocationData}
					initialLocation={
						initial.locationData
							? {
									formattedAddress: initial.locationData.formattedAddress,
									latitude: initial.locationData.latitude,
									longitude: initial.locationData.longitude,
							  }
							: undefined
					}
					disabled={loading}
				/>
			</div>

			{/* Medical Information */}
			<div className="space-y-4">
				<h3 className="font-semibold">Medical Information</h3>
				<div className="space-y-2">
					<Label htmlFor="medicalConditions">
						Medical Conditions / Allergies
					</Label>
					<Textarea
						id="medicalConditions"
						name="medicalConditions"
						defaultValue={initial.medicalConditions}
						disabled={loading}
						rows={3}
						placeholder="Any medical conditions or allergies..."
					/>
				</div>
			</div>

			{/* Emergency Contact */}
			<div className="space-y-4">
				<h3 className="font-semibold">Emergency Contact</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="emergencyName">Emergency Contact Name</Label>
						<Input
							id="emergencyName"
							name="emergencyName"
							defaultValue={initial.emergencyName}
							disabled={loading}
							placeholder="Contact person name"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="emergencyContact">Emergency Contact Number</Label>
						<Input
							id="emergencyContact"
							name="emergencyContact"
							type="tel"
							defaultValue={initial.emergencyContact}
							disabled={loading}
							placeholder="+91 9876543210"
						/>
					</div>
				</div>
			</div>

			{/* Gym Details */}
			<div className="space-y-4">
				<h3 className="font-semibold">Gym Details</h3>
				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="trainerId">Assigned Trainer</Label>
						<Select
							name="trainerId"
							defaultValue={initial.trainerId}
							disabled={loading}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select trainer" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No Trainer</SelectItem>
								{trainers.map((trainer) => (
									<SelectItem key={trainer.id} value={trainer.id}>
										{trainer.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="membershipPlanId">
							Membership Plan *
						</Label>
						{/* Hidden input to ensure formData has the value */}
						<input
							type="hidden"
							name="membershipPlanId"
							value={selectedMembershipPlan}
						/>
						<Select
							value={selectedMembershipPlan}
							onValueChange={(value) => {
								if (value && value !== "none" && value.trim() !== "") {
									setSelectedMembershipPlan(value);
								} else {
									setSelectedMembershipPlan("");
								}
							}}
							disabled={loading}
							required
						>
							<SelectTrigger className={!selectedMembershipPlan ? "border-destructive" : ""}>
								<SelectValue placeholder="Select membership plan (required)" />
							</SelectTrigger>
							<SelectContent>
								{membershipPlans.map((plan) => (
									<SelectItem key={plan.id} value={plan.id}>
										{plan.name} - ₹{plan.price} ({plan.duration} days)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{!selectedMembershipPlan && (
							<p className="text-xs text-destructive mt-1">
								Please select a membership plan to continue
							</p>
						)}
						{selectedMembershipPlan && (
							<p className="text-xs text-muted-foreground mt-1">
								Membership plan selected
							</p>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="notes">Notes</Label>
					<Textarea
						id="notes"
						name="notes"
						defaultValue={initial.notes}
						disabled={loading}
						rows={3}
						placeholder="Any additional notes about the member..."
					/>
				</div>
			</div>

			{/* Submit */}
			<div className="flex gap-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						if (!isEdit) onClearDraft?.();
						router.back();
					}}
					disabled={loading}
					className="flex-1"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={loading}
					className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
				>
					{loading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{isEdit ? "Updating..." : "Creating..."}
						</>
					) : (
						<>{isEdit ? "Update Member" : "Create Member"}</>
					)}
				</Button>
			</div>
		</form>
	);
}
