import { getPromotionById } from "@/lib/actions/promotions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import PromotionContentView from "@/components/promotions/PromotionContentView";

export default async function PromotionViewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const promotion = await getPromotionById(id);

	if (!promotion) notFound();

	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			<div className="flex items-center justify-between gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/promotions">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Promotions
					</Link>
				</Button>
				<Button variant="outline" size="sm" asChild>
					<Link href={`/promotions/${id}/edit`}>
						<Pencil className="w-4 h-4 mr-2" />
						Edit
					</Link>
				</Button>
			</div>

			{/* Post preview – how it will look when shared */}
			<Card className="overflow-hidden shadow-lg">
				<CardHeader className="pb-2">
					<h1 className="text-2xl font-bold tracking-tight">
						{promotion.title}
					</h1>
					<p className="text-xs text-muted-foreground">
						Preview – this is how your promotion will look
					</p>
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					{/* Images in order */}
					{promotion.images.length > 0 && (
						<div className="flex flex-col gap-0">
							{promotion.images.map((img) => (
								<img
									key={img.id}
									src={img.imageUrl}
									alt=""
									className="w-full max-h-[400px] object-cover"
								/>
							))}
						</div>
					)}

					{/* Description (Tiptap content) */}
					<div className="px-6 pb-4">
						<PromotionContentView
							content={promotion.description}
							className="text-foreground"
						/>
					</div>

					{/* CTA */}
					{(promotion.ctaText || promotion.ctaLink) && (
						<div className="px-6 pb-6">
							{promotion.ctaLink ? (
								<Button asChild className="w-full sm:w-auto">
									<a
										href={promotion.ctaLink}
										target="_blank"
										rel="noopener noreferrer"
									>
										{promotion.ctaText || "Learn more"}
										<ExternalLink className="w-4 h-4 ml-2" />
									</a>
								</Button>
							) : (
								<span className="text-sm font-medium">
									{promotion.ctaText}
								</span>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
