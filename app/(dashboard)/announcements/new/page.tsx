import PromotionForm from "@/components/promotions/PromotionForm";

export default function NewAnnouncementPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					New announcement
				</h1>
				<p className="text-muted-foreground mt-1">
					This will be sent to all gym profiles and appear in their notifications
				</p>
			</div>

			<PromotionForm mode="create" variant="announcement" />
		</div>
	);
}

