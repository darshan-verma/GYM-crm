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
import { deletePromotion } from "@/lib/actions/promotions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Promotion, PromotionImage } from "@prisma/client";

type PromotionWithImages = Promotion & { images: PromotionImage[] };

export default function PromotionsList({
	promotions,
	total: _total,
	currentPage: _currentPage,
	totalPages: _totalPages,
}: {
	promotions: PromotionWithImages[];
	total: number;
	currentPage: number;
	totalPages: number;
}) {
	const router = useRouter();

	async function handleDelete(id: string) {
		if (!confirm("Delete this promotion? This cannot be undone.")) return;
		const result = await deletePromotion(id);
		if (result.success) {
			toast.success("Promotion deleted");
			router.refresh();
		} else {
			toast.error("Error", {
				description: "Could not delete promotion",
			});
		}
	}

	if (promotions.length === 0) {
		return (
			<div className="py-12 text-center text-muted-foreground">
				<p className="mb-4">No promotions yet.</p>
				<Button asChild>
					<Link href="/promotions/new">Create your first promotion</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/50">
						<TableHead className="w-[200px]">Title</TableHead>
						<TableHead>Images</TableHead>
						<TableHead>CTA</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[80px]" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{promotions.map((p) => (
						<TableRow key={p.id} className="hover:bg-muted/30">
							<TableCell className="font-medium">
								<Link
									href={`/promotions/${p.id}`}
									className="hover:underline text-primary"
								>
									{p.title}
								</Link>
							</TableCell>
							<TableCell>
								{p.images.length > 0 ? (
									<div className="flex gap-1">
										{p.images.slice(0, 3).map((img) => (
											<img
												key={img.id}
												src={img.imageUrl}
												alt=""
												className="w-10 h-10 rounded object-cover border"
											/>
										))}
										{p.images.length > 3 && (
											<span className="text-xs text-muted-foreground self-center">
												+{p.images.length - 3}
											</span>
										)}
									</div>
								) : (
									<span className="text-muted-foreground text-sm">
										No images
									</span>
								)}
							</TableCell>
							<TableCell>
								{p.ctaText ? (
									<span className="text-sm">
										{p.ctaText}
										{p.ctaLink && (
											<>
												{" → "}
												<a
													href={p.ctaLink}
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
								{formatDateTime(p.createdAt)}
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
											<Link href={`/promotions/${p.id}`}>
												<Eye className="mr-2 h-4 w-4" />
												View
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href={`/promotions/${p.id}/edit`}>
												<Pencil className="mr-2 h-4 w-4" />
												Edit
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(p.id)}
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
