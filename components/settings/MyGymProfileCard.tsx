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
import { Building2, Upload, X, Droplets } from "lucide-react";
import type { GymProfile } from "@prisma/client";
import { updateGymProfile, type GymProfileFormData } from "@/lib/actions/gym-profiles";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MyGymProfileCard({ profile }: { profile: GymProfile }) {
	const router = useRouter();
	const [form, setForm] = useState<GymProfileFormData>({
		name: profile.name,
		description: profile.description ?? "",
		address: profile.address ?? "",
		phone: profile.phone ?? "",
		email: profile.email ?? "",
		logoUrl: (profile as { logoUrl?: string | null }).logoUrl ?? null,
		watermarkUrl: (profile as { watermarkUrl?: string | null }).watermarkUrl ?? null,
	});
	const [logoUploading, setLogoUploading] = useState(false);
	const [watermarkUploading, setWatermarkUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const watermarkInputRef = useRef<HTMLInputElement>(null);

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
		const result = await updateGymProfile(profile.id, form);
		if (result?.success) {
			toast.success("Gym profile updated");
			router.refresh();
		} else {
			toast.error("Failed to update");
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Building2 className="h-5 w-5" />
					Your gym profile
				</CardTitle>
				<CardDescription>
					View and edit your gym’s name, logo, and contact details. These appear in the app and on invoices.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Logo */}
					<div className="space-y-2">
						<Label>Gym logo</Label>
						<div className="flex items-center gap-4">
							{form.logoUrl ? (
								<div className="relative">
									<div className="w-20 h-20 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
										<img src={form.logoUrl} alt="Gym logo" className="w-full h-full object-contain" />
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
							<p className="text-xs text-muted-foreground">Shown in the app and on invoices. Max 2MB.</p>
						</div>
					</div>

					{/* Watermark */}
					<div className="space-y-2">
						<Label className="flex items-center gap-2">
							<Droplets className="h-4 w-4" />
							Watermark
						</Label>
						<div className="flex items-center gap-4">
							{form.watermarkUrl ? (
								<div className="relative">
									<div className="w-20 h-20 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
										<img src={form.watermarkUrl} alt="Watermark" className="w-full h-full object-contain opacity-80" />
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
							<p className="text-xs text-muted-foreground">Shown on invoice page and PDF. Max 2MB.</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="my-gym-name">Gym name *</Label>
						<Input
							id="my-gym-name"
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							placeholder="e.g. Body Temple"
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="my-gym-description">Description</Label>
						<Textarea
							id="my-gym-description"
							value={form.description}
							onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
							placeholder="Brief description of your gym"
							rows={2}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="my-gym-address">Address</Label>
						<Input
							id="my-gym-address"
							value={form.address}
							onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
							placeholder="123 Fitness Street, City, State"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="my-gym-phone">Phone</Label>
							<Input
								id="my-gym-phone"
								type="tel"
								value={form.phone}
								onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
								placeholder="+91 9876543210"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="my-gym-email">Email</Label>
							<Input
								id="my-gym-email"
								type="email"
								value={form.email}
								onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
								placeholder="contact@gym.com"
							/>
						</div>
					</div>

					<div className="flex justify-end">
						<Button type="submit">Save changes</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
