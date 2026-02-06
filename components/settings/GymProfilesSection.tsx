"use client";

import { useState, useRef } from "react";
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
import { Building2, Plus, Pencil, Trash2, Check, Upload, X, Droplets } from "lucide-react";
import type { GymProfile } from "@prisma/client";
import {
	createGymProfile,
	updateGymProfile,
	deleteGymProfile,
	setActiveGymProfile,
	type GymProfileFormData,
} from "@/lib/actions/gym-profiles";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
		logoUrl: null,
		watermarkUrl: null,
	});
	const [logoUploading, setLogoUploading] = useState(false);
	const [watermarkUploading, setWatermarkUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const watermarkInputRef = useRef<HTMLInputElement>(null);

	const resetForm = () => {
		setForm({
			name: "",
			description: "",
			address: "",
			phone: "",
			email: "",
			logoUrl: null,
			watermarkUrl: null,
		});
		setEditingId(null);
		setOpen(false);
	};

	const openCreate = () => {
		resetForm();
		setOpen(true);
	};

	const openEdit = (p: GymProfileWithActive) => {
		const logoUrl = "logoUrl" in p ? (p as { logoUrl?: string | null }).logoUrl : null;
		const watermarkUrl = "watermarkUrl" in p ? (p as { watermarkUrl?: string | null }).watermarkUrl : null;
		setForm({
			name: p.name,
			description: p.description ?? "",
			address: p.address ?? "",
			phone: p.phone ?? "",
			email: p.email ?? "",
			logoUrl: logoUrl ?? null,
			watermarkUrl: watermarkUrl ?? null,
		});
		setEditingId(p.id);
		setOpen(true);
	};

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
			toast.error("Invalid file. Use JPEG, PNG, WebP or GIF.");
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Logo should be under 2MB.");
			return;
		}
		setLogoUploading(true);
		try {
			const fd = new FormData();
			fd.set("file", file);
			fd.set("folder", "gym");
			const res = await fetch("/api/upload", { method: "POST", body: fd });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Upload failed");
			setForm((f) => ({ ...f, logoUrl: data.url }));
			toast.success("Logo uploaded");
		} catch (err) {
			toast.error((err as Error).message || "Upload failed");
		} finally {
			setLogoUploading(false);
			fileInputRef.current?.form?.reset();
		}
	};

	const removeLogo = () => setForm((f) => ({ ...f, logoUrl: null }));

	const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
			toast.error("Invalid file. Use JPEG, PNG, WebP or GIF.");
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			toast.error("Watermark should be under 2MB.");
			return;
		}
		setWatermarkUploading(true);
		try {
			const fd = new FormData();
			fd.set("file", file);
			fd.set("folder", "watermark");
			const res = await fetch("/api/upload", { method: "POST", body: fd });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Upload failed");
			setForm((f) => ({ ...f, watermarkUrl: data.url }));
			toast.success("Watermark uploaded");
		} catch (err) {
			toast.error((err as Error).message || "Upload failed");
		} finally {
			setWatermarkUploading(false);
			watermarkInputRef.current?.form?.reset();
		}
	};

	const removeWatermark = () => setForm((f) => ({ ...f, watermarkUrl: null }));

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
								{/* Gym Logo */}
								<div className="space-y-2">
									<Label>Gym Logo</Label>
									<div className="flex items-center gap-4">
										{form.logoUrl ? (
											<div className="relative">
												<div className="w-20 h-20 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
													<img
														src={form.logoUrl}
														alt="Gym logo"
														className="w-full h-full object-contain"
													/>
												</div>
												<Button
													type="button"
													variant="destructive"
													size="icon"
													className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
													onClick={removeLogo}
												>
													<X className="h-3 w-3" />
												</Button>
											</div>
										) : (
											<label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors">
												<input
													ref={fileInputRef}
													type="file"
													accept="image/jpeg,image/png,image/webp,image/gif"
													className="hidden"
													onChange={handleLogoUpload}
													disabled={logoUploading}
												/>
												{logoUploading ? (
													<span className="text-xs text-muted-foreground">Uploading...</span>
												) : (
													<Upload className="h-6 w-6 text-muted-foreground" />
												)}
												<span className="text-xs text-muted-foreground mt-1">Logo</span>
											</label>
										)}
										<p className="text-xs text-muted-foreground">
											Used in CRM, invoices and PDFs. Max 2MB, PNG/JPEG/WebP.
										</p>
									</div>
								</div>
								{/* Watermark (invoices & PDF only) */}
								<div className="space-y-2">
									<Label className="flex items-center gap-2">
										<Droplets className="h-4 w-4" />
										Watermark
									</Label>
									<div className="flex items-center gap-4">
										{form.watermarkUrl ? (
											<div className="relative">
												<div className="w-20 h-20 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
													<img
														src={form.watermarkUrl}
														alt="Watermark"
														className="w-full h-full object-contain opacity-80"
													/>
												</div>
												<Button
													type="button"
													variant="destructive"
													size="icon"
													className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
													onClick={removeWatermark}
												>
													<X className="h-3 w-3" />
												</Button>
											</div>
										) : (
											<label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors">
												<input
													ref={watermarkInputRef}
													type="file"
													accept="image/jpeg,image/png,image/webp,image/gif"
													className="hidden"
													onChange={handleWatermarkUpload}
													disabled={watermarkUploading}
												/>
												{watermarkUploading ? (
													<span className="text-xs text-muted-foreground">Uploading...</span>
												) : (
													<Droplets className="h-6 w-6 text-muted-foreground" />
												)}
												<span className="text-xs text-muted-foreground mt-1">Watermark</span>
											</label>
										)}
										<p className="text-xs text-muted-foreground">
											Shown on invoice page and PDF only. Max 2MB. Use a light or transparent image.
										</p>
									</div>
								</div>
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
						{profiles.map((profile) => {
							const profileLogoUrl = "logoUrl" in profile ? (profile as { logoUrl?: string | null }).logoUrl : undefined;
							return (
							<div
								key={profile.id}
								className="flex items-center justify-between p-4 border rounded-lg bg-card"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									{profileLogoUrl ? (
										<div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
											<img src={profileLogoUrl} alt="" className="w-full h-full object-contain" />
										</div>
									) : null}
									<div className="min-w-0 flex-1">
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
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
