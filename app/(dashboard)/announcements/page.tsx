import { getAnnouncements } from "@/lib/actions/announcements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";

export default async function AnnouncementsPage() {
	const { announcements, total } = await getAnnouncements({
		page: 1,
		limit: 20,
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Announcements
					</h1>
					<p className="text-muted-foreground mt-1">
						Send announcements to all gym profiles
					</p>
				</div>
				<Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
					<Link href="/announcements/new">
						<Plus className="w-4 h-4 mr-2" />
						New announcement
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Megaphone className="w-5 h-5" />
						All announcements
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						{total} announcement{total !== 1 ? "s" : ""} total
					</p>
				</CardHeader>
				<CardContent>
					<AnnouncementsList announcements={announcements} />
				</CardContent>
			</Card>
		</div>
	);
}

