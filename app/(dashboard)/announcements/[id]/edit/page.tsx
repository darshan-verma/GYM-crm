import { getAnnouncementById } from "@/lib/actions/announcements";
import { notFound } from "next/navigation";
import PromotionForm from "@/components/promotions/PromotionForm";

export default async function EditAnnouncementPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const announcement = await getAnnouncementById(id);
	if (!announcement) notFound();

	const initial = {
		title: announcement.title,
		description: announcement.description as unknown,
		images: announcement.images.map((img) => ({
			id: img.id,
			url: img.imageUrl,
		})),
		ctaText: announcement.ctaText,
		ctaLink: announcement.ctaLink,
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Edit announcement
				</h1>
				<p className="text-muted-foreground mt-1">
					Update title, images, description and CTA
				</p>
			</div>

			<PromotionForm
				mode="edit"
				variant="announcement"
				promotionId={id}
				initial={initial}
			/>
		</div>
	);
}

