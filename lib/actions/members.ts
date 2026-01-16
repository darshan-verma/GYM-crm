"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { MembershipStatus } from "@prisma/client";

export async function createMember(formData: FormData) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const latitudeStr = formData.get("latitude") as string;
		const longitudeStr = formData.get("longitude") as string;
		const formattedAddress = (formData.get("formattedAddress") as string) || null;

		// Helper to convert empty strings to null
		const getValue = (value: string | null | undefined): string | null => {
			if (!value || value.trim() === "" || value === "none") return null;
			return value;
		};

		const data = {
			name: formData.get("name") as string,
			email: getValue(formData.get("email") as string),
			phone: formData.get("phone") as string,
			address: getValue(formData.get("address") as string),
			city: getValue(formData.get("city") as string),
			state: getValue(formData.get("state") as string),
			pincode: getValue(formData.get("pincode") as string),
			latitude: latitudeStr ? parseFloat(latitudeStr) : null,
			longitude: longitudeStr ? parseFloat(longitudeStr) : null,
			formattedAddress: getValue(formattedAddress),
			dateOfBirth: formData.get("dateOfBirth") as string,
			gender: getValue(formData.get("gender") as string),
			emergencyContact: getValue(formData.get("emergencyContact") as string),
			emergencyName: getValue(formData.get("emergencyName") as string),
			bloodGroup: getValue(formData.get("bloodGroup") as string),
			medicalConditions: getValue(formData.get("medicalConditions") as string),
			trainerId: getValue(formData.get("trainerId") as string),
			notes: getValue(formData.get("notes") as string),
		};

		const membershipPlanId =
			(formData.get("membershipPlanId") as string) || null;

		// Handle photo upload using Vercel Blob Storage
		let photoPath = null;
		const photo = formData.get("photo") as File;
		if (photo && photo.size > 0) {
			try {
				// Upload to Vercel Blob Storage
				const filename = `members/${Date.now()}-${photo.name.replace(/\s/g, "-")}`;
				const blob = await put(filename, photo, {
					access: "public",
					contentType: photo.type,
				});
				photoPath = blob.url;
			} catch (uploadError) {
				// Silently fail photo upload - member creation should still succeed
				console.warn("Photo upload failed:", uploadError);
				photoPath = null;
			}
		}

		// Generate membership number
		const lastMember = await prisma.member.findFirst({
			orderBy: { createdAt: "desc" },
			select: { membershipNumber: true },
		});

		const lastNumber = lastMember
			? parseInt(lastMember.membershipNumber.slice(3))
			: 1000;

		const membershipNumber = `PBF${String(lastNumber + 1).padStart(4, "0")}`;

		const member = await prisma.member.create({
			data: {
				...data,
				membershipNumber,
				photo: photoPath,
				dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
				status: membershipPlanId ? "ACTIVE" : "PENDING",
			},
			include: {
				trainer: { select: { name: true } },
			},
		});

		// Create membership if plan is selected
		if (membershipPlanId) {
			const membershipPlan = await prisma.membershipPlan.findUnique({
				where: { id: membershipPlanId },
			});

			if (membershipPlan) {
				const startDate = new Date();
				const endDate = new Date(startDate);
				endDate.setDate(startDate.getDate() + membershipPlan.duration);

				await prisma.membership.create({
					data: {
						memberId: member.id,
						planId: membershipPlanId,
						startDate,
						endDate,
						amount: membershipPlan.price,
						finalAmount: membershipPlan.price,
						active: true,
						autoRenew: false,
					},
				});
			}
		}

		// Log activity (don't fail if logging fails)
		try {
			await prisma.activityLog.create({
				data: {
					userId: session.user.id,
					action: "CREATE",
					entity: "Member",
					entityId: member.id,
					details: {
						membershipNumber,
						name: member.name,
						membershipCreated: !!membershipPlanId,
					},
				},
			});
		} catch (logError) {
			console.warn("Failed to create activity log:", logError);
			// Don't fail member creation if logging fails
		}

		revalidatePath("/members");
		return { success: true, data: member };
	} catch (error) {
		console.error("Create member error:", error);
		// Provide more detailed error message
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		return { 
			success: false, 
			error: `Failed to create member: ${errorMessage}` 
		};
	}
}

export async function getMembers(params?: {
	search?: string;
	status?: MembershipStatus;
	trainerId?: string;
	page?: number;
	limit?: number;
}) {
	const { search, status, trainerId, page = 1, limit = 20 } = params || {};

	const where: Record<string, unknown> = {};

	if (search) {
		where.OR = [
			{ name: { contains: search, mode: "insensitive" } },
			{ phone: { contains: search } },
			{ membershipNumber: { contains: search, mode: "insensitive" } },
			{ email: { contains: search, mode: "insensitive" } },
		];
	}

	if (status) {
		where.status = status;
	}

	if (trainerId) {
		where.trainerId = trainerId;
	}

	const [members, total] = await Promise.all([
		prisma.member.findMany({
			where,
			select: {
				id: true,
				name: true,
				membershipNumber: true,
				phone: true,
				email: true,
				photo: true,
				status: true,
				trainer: { select: { id: true, name: true } },
				memberships: {
					where: { active: true },
					include: { plan: true },
					orderBy: { endDate: "desc" },
					take: 1,
				},
				_count: {
					select: {
						payments: true,
						attendance: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: (page - 1) * limit,
			take: limit,
		}),
		prisma.member.count({ where }),
	]);

	return {
		members,
		total,
		pages: Math.ceil(total / limit),
		currentPage: page,
	};
}

export async function getMemberById(id: string) {
	return await prisma.member.findUnique({
		where: { id },
		include: {
			trainer: true,
			memberships: {
				include: { plan: true },
				orderBy: { createdAt: "desc" },
			},
			payments: {
				orderBy: { paymentDate: "desc" },
				take: 20,
			},
			attendance: {
				orderBy: { date: "desc" },
				take: 30,
			},
			workoutPlans: {
				where: { active: true },
				orderBy: { createdAt: "desc" },
			},
			dietPlans: {
				where: { active: true },
				orderBy: { createdAt: "desc" },
			},
		},
	});
}

export async function updateMember(id: string, formData: FormData) {
	const session = await auth();
	if (!session) throw new Error("Unauthorized");

	try {
		const latitudeStr = formData.get("latitude") as string;
		const longitudeStr = formData.get("longitude") as string;
		const formattedAddress = (formData.get("formattedAddress") as string) || null;

		let data: Record<string, unknown> = {
			name: formData.get("name") as string,
			email: (formData.get("email") as string) || null,
			phone: formData.get("phone") as string,
			address: (formData.get("address") as string) || null,
			city: (formData.get("city") as string) || null,
			state: (formData.get("state") as string) || null,
			latitude: latitudeStr ? parseFloat(latitudeStr) : null,
			longitude: longitudeStr ? parseFloat(longitudeStr) : null,
			formattedAddress: formattedAddress,
			trainerId: (formData.get("trainerId") as string) || null,
			notes: (formData.get("notes") as string) || null,
		};

		const membershipPlanId =
			(formData.get("membershipPlanId") as string) || null;

		// Handle photo upload using Vercel Blob Storage
		const photo = formData.get("photo") as File;
		if (photo && photo.size > 0) {
			try {
				// Upload to Vercel Blob Storage
				const filename = `members/${Date.now()}-${photo.name.replace(/\s/g, "-")}`;
				const blob = await put(filename, photo, {
					access: "public",
					contentType: photo.type,
				});
				data.photo = blob.url;
			} catch (uploadError) {
				// Silently fail photo upload - member update should still succeed
				console.warn("Photo upload failed:", uploadError);
				// Don't update photo if upload fails
			}
		}

		// Get current active membership
		const currentMembership = await prisma.membership.findFirst({
			where: { memberId: id, active: true },
		});

		// Handle membership plan changes
		if (membershipPlanId && membershipPlanId !== currentMembership?.planId) {
			// Plan changed or new plan selected
			const membershipPlan = await prisma.membershipPlan.findUnique({
				where: { id: membershipPlanId },
			});

			if (membershipPlan) {
				// Deactivate current membership if exists
				if (currentMembership) {
					await prisma.membership.update({
						where: { id: currentMembership.id },
						data: { active: false },
					});
				}

				// Create new membership
				const startDate = new Date();
				const endDate = new Date(startDate);
				endDate.setDate(startDate.getDate() + membershipPlan.duration);

				await prisma.membership.create({
					data: {
						memberId: id,
						planId: membershipPlanId,
						startDate,
						endDate,
						amount: membershipPlan.price,
						finalAmount: membershipPlan.price,
						active: true,
						autoRenew: false,
					},
				});

				data.status = "ACTIVE";
			}
		} else if (!membershipPlanId && currentMembership) {
			// Plan removed
			await prisma.membership.update({
				where: { id: currentMembership.id },
				data: { active: false },
			});
			data.status = "PENDING";
		}

		const member = await prisma.member.update({
			where: { id },
			data,
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "UPDATE",
				entity: "Member",
				entityId: id,
				details: { name: member.name },
			},
		});

		revalidatePath(`/members/${id}`);
		revalidatePath(`/members/${id}/edit`);
		revalidatePath("/members");
		return { success: true, data: member };
	} catch (_error) {
		return { success: false, error: "Failed to update member" };
	}
}

export async function deleteMember(id: string) {
	const session = await auth();
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	try {
		const member = await prisma.member.delete({
			where: { id },
		});

		await prisma.activityLog.create({
			data: {
				userId: session.user.id,
				action: "DELETE",
				entity: "Member",
				entityId: id,
				details: { name: member.name },
			},
		});

		revalidatePath("/members");
		return { success: true };
	} catch (_error) {
		return { success: false, error: "Failed to delete member" };
	}
}

export async function getTrainers() {
	return await prisma.user.findMany({
		where: {
			role: "TRAINER",
			active: true,
		},
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
		},
	});
}
