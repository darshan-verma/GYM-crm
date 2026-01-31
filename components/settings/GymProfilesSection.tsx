"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Pencil, Trash2, Check } from "lucide-react";
import type { GymProfile } from "@prisma/client";
import {
	createGymProfile,
	updateGymProfile,
	deleteGymProfile,
	setActiveGymProfile,
	type GymProfileFormData,
} from "@/lib/actions/gym-profiles";
import { useRouter } from "next/navigation";

type GymProfileWithActive = GymProfile & { isActive?: boolean };

export default function GymProfilesSection({
	profiles,
	activeId,
}: {
	profiles: GymProfileWithActive[];
	activeId: string | null;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<GymProfileFormData>({
		name: "",
		description: "",
		address: "",
		phone: "",
		email: "",
	});

	const resetForm = () => {
		setForm({
			name: "",
			description: "",
			address: "",
			phone: "",
			email: "",
		});
		setEditingId(null);
		setOpen(false);
	};

	const openCreate = () => {
		resetForm();
		setOpen(true);
	};

	const openEdit = (p: GymProfile) => {
		setForm({
			name: p.name,
			description: p.description ?? "",
			address: p.address ?? "",
			phone: p.phone ?? "",
			email: p.email ?? "",
		});
		setEditingId(p.id);
		setOpen(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) return;
		if (editingId) {
			await updateGymProfile(editingId, form);
		} else {
			await createGymProfile(form);
		}
		resetForm();
		router.refresh();
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this gym profile? This cannot be undone.")) return;
		await deleteGymProfile(id);
		router.refresh();
	};

	const handleSetActive = async (id: string) => {
		await setActiveGymProfile(id);
		router.refresh();
	};

	const handleClearActive = async () => {
		await setActiveGymProfile(null);
		router.refresh();
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Gym Profiles
						</CardTitle>
						<CardDescription>
							Create and manage gym profiles. The selected profile is used in
							invoices, PDFs, and the CRM title.
						</CardDescription>
					</div>
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button onClick={openCreate}>
								<Plus className="h-4 w-4 mr-2" />
								Add Profile
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-md">
							<DialogHeader>
								<DialogTitle>
									{editingId ? "Edit Gym Profile" : "New Gym Profile"}
								</DialogTitle>
								<DialogDescription>
									Enter the gym details. Name is required.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">Gym Name *</Label>
									<Input
										id="name"
										value={form.name}
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
										placeholder="e.g. Pro Bodyline Fitness"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={form.description}
										onChange={(e) =>
											setForm((f) => ({ ...f, description: e.target.value }))
										}
										placeholder="Brief description of your gym"
										rows={2}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="address">Address</Label>
									<Input
										id="address"
										value={form.address}
										onChange={(e) =>
											setForm((f) => ({ ...f, address: e.target.value }))
										}
										placeholder="123 Fitness Street, City, State"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="phone">Phone</Label>
										<Input
											id="phone"
											type="tel"
											value={form.phone}
											onChange={(e) =>
												setForm((f) => ({ ...f, phone: e.target.value }))
											}
											placeholder="+91 9876543210"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											value={form.email}
											onChange={(e) =>
												setForm((f) => ({ ...f, email: e.target.value }))
											}
											placeholder="contact@gym.com"
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onClick={() => setOpen(false)}
									>
										Cancel
									</Button>
									<Button type="submit">
										{editingId ? "Save Changes" : "Create Profile"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{profiles.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
						<Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
						<p className="font-medium">No gym profiles yet</p>
						<p className="text-sm mt-1">
							Add a profile to use your gym details in invoices and the CRM.
						</p>
						<Button variant="outline" className="mt-4" onClick={openCreate}>
							<Plus className="h-4 w-4 mr-2" />
							Add First Profile
						</Button>
					</div>
				) : (
					<div className="space-y-3">
						{activeId && (
							<p className="text-sm text-muted-foreground">
								Active profile (used everywhere): select one below.
							</p>
						)}
						{profiles.map((profile) => (
							<div
								key={profile.id}
								className="flex items-center justify-between p-4 border rounded-lg bg-card"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="font-semibold">{profile.name}</p>
										{activeId === profile.id && (
											<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												<Check className="h-3 w-3" />
												Active
											</span>
										)}
									</div>
									{profile.description && (
										<p className="text-sm text-muted-foreground mt-1 line-clamp-1">
											{profile.description}
										</p>
									)}
									<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
										{profile.address && (
											<span className="truncate">{profile.address}</span>
										)}
										{profile.phone && <span>{profile.phone}</span>}
										{profile.email && <span>{profile.email}</span>}
									</div>
								</div>
								<div className="flex items-center gap-2 ml-4">
									{activeId !== profile.id ? (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleSetActive(profile.id)}
										>
											Set as active
										</Button>
									) : (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleClearActive}
										>
											Clear active
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEdit(profile)}
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(profile.id)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
