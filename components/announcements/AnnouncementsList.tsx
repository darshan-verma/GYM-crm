"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";
import { deleteAnnouncement } from "@/lib/actions/announcements";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AnnouncementWithImages = {
	id: string;
	title: string;
	ctaText: string | null;
	ctaLink: string | null;
	createdAt: Date;
	images: Array<{ id: string; imageUrl: string }>;
};

export default function AnnouncementsList({
	announcements,
}: {
	announcements: AnnouncementWithImages[];
}) {
	const router = useRouter();

	async function handleDelete(id: string) {
		if (!confirm("Delete this announcement? This cannot be undone.")) return;
		const result = await deleteAnnouncement(id);
		if (result.success) {
			toast.success("Announcement deleted");
			router.refresh();
		} else {
			toast.error("Error", {
				description: "Could not delete announcement",
			});
		}
	}

	if (announcements.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				<p className="mb-4">No announcements yet.</p>
				<Button asChild>
					<Link href="/announcements/new">Create your first announcement</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50">
						<TableHead className="w-[240px]">Title</TableHead>
						<TableHead>Images</TableHead>
						<TableHead>CTA</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[80px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{announcements.map((a) => (
						<TableRow key={a.id} className="hover:bg-muted/30">
							<TableCell className="font-medium">
								<Link
									href={`/announcements/${a.id}`}
									className="hover:underline text-primary"
								>
									{a.title}
								</Link>
							</TableCell>
							<TableCell>
								{a.images.length > 0 ? (
									<div className="flex gap-1">
										{a.images.slice(0, 3).map((img: { id: string; imageUrl: string }) => (
											<img
												key={img.id}
												src={img.imageUrl}
												alt=""
												className="w-10 h-10 rounded object-cover border"
											/>
										))}
										{a.images.length > 3 && (
											<span className="text-xs text-muted-foreground self-center">
												+{a.images.length - 3}
											</span>
										)}
									</div>
								) : (
									<span className="text-muted-foreground text-sm">No images</span>
								)}
							</TableCell>
							<TableCell>
								{a.ctaText ? (
									<span className="text-sm">
										{a.ctaText}
										{a.ctaLink && (
											<>
												{" → "}
												<a
													href={a.ctaLink}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:underline"
												>
													Link
												</a>
											</>
										)}
									</span>
								) : (
									<span className="text-muted-foreground text-sm">—</span>
								)}
							</TableCell>
							<TableCell className="text-muted-foreground text-sm">
								{formatDateTime(a.createdAt)}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem asChild>
											<Link href={`/announcements/${a.id}`}>
												<Eye className="mr-2 h-4 w-4" />
												View
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/announcements/${a.id}/edit`}>
												<Pencil className="mr-2 h-4 w-4" />
												Edit
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(a.id)}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

