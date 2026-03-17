import { getAnnouncementById } from "@/lib/actions/announcements";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Pencil, ExternalLink } from "lucide-react";
import PromotionContentView from "@/components/promotions/PromotionContentView";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export default async function AnnouncementViewPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const announcement = await getAnnouncementById(id);
	if (!announcement) notFound();

	const session = await auth();
	const isSuperAdmin = session?.user?.role === UserRole.SUPER_ADMIN;

	return (
		<div className="space-y-6 max-w-2xl mx-auto">
			<div className="flex items-center justify-between gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href={isSuperAdmin ? "/announcements" : "/"}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back
					</Link>
				</Button>
				{isSuperAdmin && (
					<Button variant="outline" size="sm" asChild>
						<Link href={`/announcements/${id}/edit`}>
							<Pencil className="w-4 h-4 mr-2" />
							Edit
						</Link>
					</Button>
				)}
			</div>

			<Card className="overflow-hidden shadow-lg">
				<CardHeader className="pb-2">
					<h1 className="text-2xl font-bold tracking-tight">
						{announcement.title}
					</h1>
					<p className="text-xs text-muted-foreground">
						Announcement
					</p>
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					{announcement.images.length > 0 && (
						<div className="flex flex-col gap-0">
							{announcement.images.map((img) => (
								<img
									key={img.id}
									src={img.imageUrl}
									alt=""
									className="w-full max-h-[400px] object-cover"
								/>
							))}
						</div>
					)}

					<div className="px-6 pb-4">
						<PromotionContentView
							content={announcement.description}
							className="text-foreground"
						/>
					</div>

					{(announcement.ctaText || announcement.ctaLink) && (
						<div className="px-6 pb-6">
							{announcement.ctaLink ? (
								<Button asChild className="w-full sm:w-auto">
									<a
										href={announcement.ctaLink}
										target="_blank"
										rel="noopener noreferrer"
									>
										{announcement.ctaText || "Learn more"}
										<ExternalLink className="w-4 h-4 ml-2" />
									</a>
								</Button>
							) : (
								<span className="text-sm font-medium">
									{announcement.ctaText}
								</span>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

