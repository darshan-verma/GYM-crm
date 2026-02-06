import { getPromotionById } from "@/lib/actions/promotions";
import { notFound } from "next/navigation";
import PromotionForm from "@/components/promotions/PromotionForm";

export default async function EditPromotionPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const promotion = await getPromotionById(id);

	if (!promotion) notFound();

	const initial = {
		title: promotion.title,
		description: promotion.description as unknown,
		images: promotion.images.map((img) => ({
			id: img.id,
			url: img.imageUrl,
		})),
		ctaText: promotion.ctaText,
		ctaLink: promotion.ctaLink,
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Edit promotion
				</h1>
				<p className="text-muted-foreground mt-1">
					Update title, images, description and CTA
				</p>
			</div>

			<PromotionForm
				mode="edit"
				promotionId={id}
				initial={initial}
			/>
		</div>
	);
}
