"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PromotionEditor from "./PromotionEditor";
import PromotionImages, { type PromoImage } from "./PromotionImages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createPromotion, updatePromotion, type PromoImageInput } from "@/lib/actions/promotions";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions/announcements";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type PromotionFormProps = {
	variant?: "promotion" | "announcement";
	mode: "create" | "edit";
	promotionId?: string;
	initial?: {
		title: string;
		description: unknown;
		images: PromoImage[];
		ctaText: string | null;
		ctaLink: string | null;
	};
};

export default function PromotionForm({
	variant = "promotion",
	mode,
	promotionId,
	initial,
}: PromotionFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [title, setTitle] = useState(initial?.title ?? "");
	const [description, setDescription] = useState<unknown>(
		initial?.description ?? null
	);
	const [images, setImages] = useState<PromoImage[]>(
		initial?.images ?? []
	);
	const [ctaText, setCtaText] = useState(initial?.ctaText ?? "");
	const [ctaLink, setCtaLink] = useState(initial?.ctaLink ?? "");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		const imagePayload: PromoImageInput[] = images.map((img) => ({
			id: img.id,
			url: img.url,
		}));

		// Ensure plain serializable payload (avoids "client reference" errors with server actions)
		const defaultDoc = { type: "doc", content: [] };
		const descriptionPayload =
			description != null && typeof description === "object"
				? JSON.parse(JSON.stringify(description))
				: defaultDoc;

		try {
			if (mode === "create") {
				const result =
					variant === "announcement"
						? await createAnnouncement({
								title,
								description: descriptionPayload,
								images: imagePayload,
								ctaText: ctaText || null,
								ctaLink: ctaLink || null,
							})
						: await createPromotion({
								title,
								description: descriptionPayload,
								images: imagePayload,
								ctaText: ctaText || null,
								ctaLink: ctaLink || null,
							});
				if (result.success) {
					toast.success(
						variant === "announcement" ? "Announcement created" : "Promotion created",
						{
							description:
								variant === "announcement"
									? "Your announcement has been sent to all gyms."
									: "Your promotion has been saved.",
						}
					);
					router.push(variant === "announcement" ? "/announcements" : "/promotions");
					router.refresh();
				} else {
					toast.error("Error", {
						description:
							variant === "announcement"
								? "Failed to create announcement."
								: "Failed to create promotion.",
					});
				}
			} else if (promotionId) {
				const result =
					variant === "announcement"
						? await updateAnnouncement(promotionId, {
								title,
								description: descriptionPayload,
								images: imagePayload,
								ctaText: ctaText || null,
								ctaLink: ctaLink || null,
							})
						: await updatePromotion(promotionId, {
								title,
								description: descriptionPayload,
								images: imagePayload,
								ctaText: ctaText || null,
								ctaLink: ctaLink || null,
							});
				if (result.success) {
					toast.success(
						variant === "announcement" ? "Announcement updated" : "Promotion updated",
						{
							description: "Your changes have been saved.",
						}
					);
					router.push(variant === "announcement" ? "/announcements" : "/promotions");
					router.refresh();
				} else {
					toast.error("Error", {
						description:
							variant === "announcement"
								? "Failed to update announcement."
								: "Failed to update promotion.",
					});
				}
			}
		} catch {
			toast.error("Error", {
				description: "Something went wrong.",
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
			<div className="flex items-center gap-4">
				<Button type="button" variant="ghost" size="sm" asChild>
					<Link href={variant === "announcement" ? "/announcements" : "/promotions"}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Title</CardTitle>
					<CardDescription>
						Short headline for this {variant === "announcement" ? "announcement" : "promotion"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Input
						placeholder="e.g. Summer membership offer"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="text-base"
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Images</CardTitle>
					<CardDescription>
						Add and reorder images (drag to change order)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PromotionImages images={images} setImages={setImages} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Description</CardTitle>
					<CardDescription>
						Rich text description for the {variant === "announcement" ? "announcement" : "promotion"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PromotionEditor
						value={description}
						onChange={setDescription}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Call to action (optional)</CardTitle>
					<CardDescription>
						Button text and link for WhatsApp, website, etc.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="ctaText">CTA text</Label>
						<Input
							id="ctaText"
							placeholder="e.g. Join now"
							value={ctaText}
							onChange={(e) => setCtaText(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="ctaLink">CTA link</Label>
						<Input
							id="ctaLink"
							type="url"
							placeholder="https://..."
							value={ctaLink}
							onChange={(e) => setCtaLink(e.target.value)}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading && (
						<Loader2 className="w-4 h-4 mr-2 animate-spin" />
					)}
					{mode === "create"
						? variant === "announcement"
							? "Send announcement"
							: "Save promotion"
						: variant === "announcement"
							? "Update announcement"
							: "Update promotion"}
				</Button>
			</div>
		</form>
	);
}
