import { getPromotions } from "@/lib/actions/promotions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import PromotionsList from "@/components/promotions/PromotionsList";

export default async function PromotionsPage() {
	const { promotions, total, pages, currentPage } = await getPromotions({
		page: 1,
		limit: 20,
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Promotions
					</h1>
					<p className="text-muted-foreground mt-1">
						Create and manage promotional posts for your gym
					</p>
				</div>
				<Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
					<Link href="/promotions/new">
						<Plus className="w-4 h-4 mr-2" />
						New promotion
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Megaphone className="w-5 h-5" />
						All promotions
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						{total} promotion{total !== 1 ? "s" : ""} total
					</p>
				</CardHeader>
				<CardContent>
					<PromotionsList
						promotions={promotions}
						total={total}
						currentPage={currentPage}
						totalPages={pages}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
