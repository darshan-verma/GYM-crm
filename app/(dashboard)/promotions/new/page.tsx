import PromotionForm from "@/components/promotions/PromotionForm";

export default function NewPromotionPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					New promotion
				</h1>
				<p className="text-muted-foreground mt-1">
					Create a post for promotions and marketing
				</p>
			</div>

			<PromotionForm mode="create" />
		</div>
	);
}
