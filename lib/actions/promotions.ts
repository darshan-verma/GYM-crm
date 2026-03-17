"use server";

import prisma from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireCurrentGymProfileId } from "./gym-profiles";

export type PromoImageInput = { id: string; url: string };

export async function createPromotion(data: {
	title: string;
	description: unknown;
	images: PromoImageInput[];
	ctaText?: string | null;
	ctaLink?: string | null;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const promotion = await prisma.promotion.create({
		data: {
			gymProfileId,
			title: data.title,
			description: data.description as object,
			ctaText: data.ctaText || null,
			ctaLink: data.ctaLink || null,
			images: {
				create: data.images.map((img, i) => ({
					imageUrl: img.url,
					position: i,
				})),
			},
		},
	});

	revalidatePath("/promotions");
	return { success: true, id: promotion.id };
}

export async function getPromotions(params?: {
	page?: number;
	limit?: number;
}) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const page = params?.page ?? 1;
	const limit = params?.limit ?? 20;
	const skip = (page - 1) * limit;

	const [promotions, total] = await Promise.all([
		prisma.promotion.findMany({
			where: { gymProfileId },
			include: {
				images: { orderBy: { position: "asc" } },
			},
			orderBy: { createdAt: "desc" },
			skip,
			take: limit,
		}),
		prisma.promotion.count({ where: { gymProfileId } }),
	]);

	return {
		promotions,
		total,
		pages: Math.ceil(total / limit),
		currentPage: page,
	};
}

export async function getPromotionById(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	return prisma.promotion.findFirst({
		where: { id, gymProfileId },
		include: {
			images: { orderBy: { position: "asc" } },
		},
	});
}

export async function updatePromotion(
	id: string,
	data: {
		title: string;
		description: unknown;
		images: PromoImageInput[];
		ctaText?: string | null;
		ctaLink?: string | null;
	}
) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const existing = await prisma.promotion.findFirst({
		where: { id, gymProfileId },
		select: { id: true },
	});
	if (!existing) throw new Error("Promotion not found");

	await prisma.promotionImage.deleteMany({
		where: { promotionId: id, promotion: { gymProfileId } },
	});

	await prisma.promotion.update({
		where: { id },
		data: {
			title: data.title,
			description: data.description as object,
			ctaText: data.ctaText || null,
			ctaLink: data.ctaLink || null,
			images: {
				create: data.images.map((img, i) => ({
					imageUrl: img.url,
					position: i,
				})),
			},
		},
	});

	revalidatePath("/promotions");
	revalidatePath(`/promotions/${id}`);
	revalidatePath(`/promotions/${id}/edit`);
	return { success: true };
}

export async function deletePromotion(id: string) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");
	const gymProfileId = await requireCurrentGymProfileId(session);

	const existing = await prisma.promotion.findFirst({
		where: { id, gymProfileId },
		select: { id: true },
	});
	if (!existing) throw new Error("Promotion not found");

	await prisma.promotion.delete({ where: { id } });
	revalidatePath("/promotions");
	return { success: true };
}
