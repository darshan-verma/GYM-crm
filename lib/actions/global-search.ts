"use server";

import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { requireCurrentGymProfileId } from "@/lib/actions/gym-profiles";

const DASHBOARD_PAGES: { name: string; href: string }[] = [
	{ name: "Dashboard", href: "/" },
	{ name: "Leads", href: "/leads" },
	{ name: "Promotions", href: "/promotions" },
	{ name: "Announcements", href: "/announcements" },
	{ name: "Members", href: "/members" },
	{ name: "Billing", href: "/billing" },
	{ name: "Trainers", href: "/trainers" },
	{ name: "Staff", href: "/staff" },
	{ name: "Attendance", href: "/attendance" },
	{ name: "Memberships", href: "/memberships" },
	{ name: "Workouts", href: "/workouts" },
	{ name: "Diet Plans", href: "/diets" },
	{ name: "Reports", href: "/reports" },
	{ name: "Settings", href: "/settings" },
];

export type GlobalSearchResult = {
	pages: { name: string; href: string }[];
	members: { id: string; name: string; membershipNumber: string }[];
	payments: {
		id: string;
		invoiceNumber: string;
		amount: number;
		memberName: string | null;
	}[];
};

export async function globalSearch(query: string): Promise<GlobalSearchResult> {
	const session = await auth();
	if (!session) {
		return { pages: [], members: [], payments: [] };
	}

	let gymProfileId: string;
	try {
		gymProfileId = await requireCurrentGymProfileId(session);
	} catch {
		return { pages: [], members: [], payments: [] };
	}

	const trimmed = query.trim();
	const hasQuery = trimmed.length >= 2;

	// Pages: filter static list by query (case-insensitive) or return all when empty
	const pages = hasQuery
		? DASHBOARD_PAGES.filter((p) =>
				p.name.toLowerCase().includes(trimmed.toLowerCase())
		  )
		: DASHBOARD_PAGES;

	// Members and payments only when query is long enough
	let members: GlobalSearchResult["members"] = [];
	let payments: GlobalSearchResult["payments"] = [];

	if (hasQuery) {
		const [membersResult, paymentsResult] = await Promise.all([
			prisma.member.findMany({
				where: {
					gymProfileId,
					membershipNumber: { contains: trimmed, mode: "insensitive" },
				},
				take: 10,
				select: {
					id: true,
					name: true,
					membershipNumber: true,
				},
			}),
			prisma.payment.findMany({
				where: {
					gymProfileId,
					invoiceNumber: { contains: trimmed, mode: "insensitive" },
				},
				take: 10,
				select: {
					id: true,
					invoiceNumber: true,
					amount: true,
					member: { select: { name: true } },
				},
			}),
		]);

		members = membersResult;
		payments = paymentsResult.map((p) => ({
			id: p.id,
			invoiceNumber: p.invoiceNumber,
			amount: Number(p.amount),
			memberName: p.member?.name ?? null,
		}));
	}

	return { pages, members, payments };
}
