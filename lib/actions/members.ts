"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

		const data = {
			name: formData.get("name") as string,
			email: (formData.get("email") as string) || null,
			phone: formData.get("phone") as string,
			address: (formData.get("address") as string) || null,
			city: (formData.get("city") as string) || null,
			state: (formData.get("state") as string) || null,
			pincode: (formData.get("pincode") as string) || null,
			latitude: latitudeStr ? parseFloat(latitudeStr) : null,
			longitude: longitudeStr ? parseFloat(longitudeStr) : null,
			formattedAddress: formattedAddress,
			dateOfBirth: formData.get("dateOfBirth") as string,
			gender: (formData.get("gender") as string) || null,
			emergencyContact: (formData.get("emergencyContact") as string) || null,
			emergencyName: (formData.get("emergencyName") as string) || null,
			bloodGroup: (formData.get("bloodGroup") as string) || null,
			medicalConditions: (formData.get("medicalConditions") as string) || null,
			trainerId: (formData.get("trainerId") as string) || null,
			notes: (formData.get("notes") as string) || null,
		};

		const membershipPlanId =
			(formData.get("membershipPlanId") as string) || null;

		// Handle photo upload
		let photoPath = null;
		const photo = formData.get("photo") as File;
		if (photo && photo.size > 0) {
			const bytes = await photo.arrayBuffer();
			const buffer = Buffer.from(bytes);

			// Create upload directory if it doesn't exist
			const uploadDir = path.join(process.cwd(), "public/uploads/members");
			await mkdir(uploadDir, { recursive: true });

			const filename = `${Date.now()}-${photo.name.replace(/\s/g, "-")}`;
			const filepath = path.join(uploadDir, filename);
			await writeFile(filepath, buffer);
			photoPath = `/uploads/members/${filename}`;
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

		// Log activity
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

		revalidatePath("/members");
		return { success: true, data: member };
	} catch (error) {
		console.error("Create member error:", error);
		return { success: false, error: "Failed to create member" };
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

		// Handle photo upload
		const photo = formData.get("photo") as File;
		if (photo && photo.size > 0) {
			const bytes = await photo.arrayBuffer();
			const buffer = Buffer.from(bytes);

			// Create upload directory if it doesn't exist
			const uploadDir = path.join(process.cwd(), "public/uploads/members");
			await mkdir(uploadDir, { recursive: true });

			const filename = `${Date.now()}-${photo.name.replace(/\s/g, "-")}`;
			const filepath = path.join(uploadDir, filename);
			await writeFile(filepath, buffer);
			data.photo = `/uploads/members/${filename}`;
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
