"use client";

import { useState, useRef } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	useSortable,
	arrayMove,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PromoImage = {
	id: string;
	url: string;
};

function SortableImage({
	img,
	onRemove,
}: {
	img: PromoImage;
	onRemove: () => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: img.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"relative group rounded-lg border bg-muted/30 overflow-hidden",
				isDragging && "z-10 opacity-90 shadow-lg"
			)}
		>
			<div
				className="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing rounded bg-black/50 p-1.5 text-white hover:bg-black/70"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="h-4 w-4" />
			</div>
			<button
				type="button"
				onClick={onRemove}
				className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-red-600 transition-colors"
				aria-label="Remove image"
			>
				<X className="h-4 w-4" />
			</button>
			<img
				src={img.url}
				alt=""
				className="w-full h-28 object-cover pointer-events-none"
			/>
		</div>
	);
}

export default function PromotionImages({
	images,
	setImages,
	className,
}: {
	images: PromoImage[];
	setImages: (imgs: PromoImage[]) => void;
	className?: string;
}) {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	async function upload(file: File) {
		setError(null);
		setUploading(true);
		const fd = new FormData();
		fd.append("file", file);

		try {
			const res = await fetch("/api/upload", { method: "POST", body: fd });
			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Upload failed");
				return;
			}

			setImages([
				...images,
				{ id: crypto.randomUUID(), url: data.url as string },
			]);
		} catch {
			setError("Upload failed");
		} finally {
			setUploading(false);
		}
	}

	function handleDragEnd(e: DragEndEvent) {
		const { active, over } = e;
		if (!over || active.id === over.id) return;

		const oldIndex = images.findIndex((i) => i.id === active.id);
		const newIndex = images.findIndex((i) => i.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		setImages(arrayMove(images, oldIndex, newIndex));
	}

	const inputRef = useRef<HTMLInputElement | null>(null);

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center gap-2">
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="sr-only"
					disabled={uploading}
					onChange={(e) => {
						const f = e.target.files?.[0];
						if (f) upload(f);
						e.target.value = "";
					}}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="gap-2"
					disabled={uploading}
					onClick={() => inputRef.current?.click()}
				>
					{uploading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<ImagePlus className="h-4 w-4" />
					)}
					{uploading ? "Uploading…" : "Add image"}
				</Button>
				{error && (
					<span className="text-sm text-destructive">{error}</span>
				)}
			</div>

			<DndContext
				collisionDetection={closestCenter}
				sensors={sensors}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={images.map((i) => i.id)}>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{images.map((img) => (
							<SortableImage
								key={img.id}
								img={img}
								onRemove={() =>
									setImages(images.filter((x) => x.id !== img.id))
								}
							/>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{images.length === 0 && (
				<p className="text-sm text-muted-foreground">
					No images yet. Add images to use in this promotion.
				</p>
			)}
		</div>
	);
}
