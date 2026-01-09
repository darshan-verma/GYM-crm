/* eslint-disable no-undef */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default permissions for each role
const defaultPermissions = {
	SUPER_ADMIN: [
		"VIEW_DASHBOARD",
		"VIEW_MEMBERS",
		"CREATE_MEMBERS",
		"EDIT_MEMBERS",
		"DELETE_MEMBERS",
		"VIEW_BILLING",
		"CREATE_PAYMENTS",
		"EDIT_PAYMENTS",
		"VIEW_INVOICES",
		"CREATE_INVOICES",
		"VIEW_WORKOUTS",
		"CREATE_WORKOUTS",
		"EDIT_WORKOUTS",
		"DELETE_WORKOUTS",
		"VIEW_DIETS",
		"CREATE_DIETS",
		"EDIT_DIETS",
		"DELETE_DIETS",
		"VIEW_ATTENDANCE",
		"MARK_ATTENDANCE",
		"VIEW_LEADS",
		"CREATE_LEADS",
		"EDIT_LEADS",
		"VIEW_REPORTS",
		"VIEW_STAFF",
		"CREATE_STAFF",
		"EDIT_STAFF",
		"DELETE_STAFF",
		"VIEW_SETTINGS",
		"EDIT_SETTINGS",
	],
	ADMIN: [
		"VIEW_DASHBOARD",
		"VIEW_MEMBERS",
		"CREATE_MEMBERS",
		"EDIT_MEMBERS",
		"DELETE_MEMBERS",
		"VIEW_BILLING",
		"CREATE_PAYMENTS",
		"EDIT_PAYMENTS",
		"VIEW_INVOICES",
		"CREATE_INVOICES",
		"VIEW_WORKOUTS",
		"CREATE_WORKOUTS",
		"EDIT_WORKOUTS",
		"DELETE_WORKOUTS",
		"VIEW_DIETS",
		"CREATE_DIETS",
		"EDIT_DIETS",
		"DELETE_DIETS",
		"VIEW_ATTENDANCE",
		"MARK_ATTENDANCE",
		"VIEW_LEADS",
		"CREATE_LEADS",
		"EDIT_LEADS",
		"VIEW_REPORTS",
		"VIEW_STAFF",
		"CREATE_STAFF",
		"EDIT_STAFF",
		"DELETE_STAFF",
		"VIEW_SETTINGS",
		"EDIT_SETTINGS",
	],
	TRAINER: [
		"VIEW_DASHBOARD",
		"VIEW_MEMBERS",
		"EDIT_MEMBERS",
		"VIEW_WORKOUTS",
		"CREATE_WORKOUTS",
		"EDIT_WORKOUTS",
		"DELETE_WORKOUTS",
		"VIEW_DIETS",
		"CREATE_DIETS",
		"EDIT_DIETS",
		"DELETE_DIETS",
		"VIEW_ATTENDANCE",
		"MARK_ATTENDANCE",
	],
	RECEPTIONIST: [
		"VIEW_DASHBOARD",
		"VIEW_MEMBERS",
		"CREATE_MEMBERS",
		"EDIT_MEMBERS",
		"VIEW_BILLING",
		"CREATE_PAYMENTS",
		"EDIT_PAYMENTS",
		"VIEW_INVOICES",
		"CREATE_INVOICES",
		"VIEW_ATTENDANCE",
		"MARK_ATTENDANCE",
		"VIEW_LEADS",
		"CREATE_LEADS",
		"EDIT_LEADS",
	],
	HELPER: [
		"VIEW_DASHBOARD",
		"VIEW_MEMBERS",
		"VIEW_ATTENDANCE",
		"MARK_ATTENDANCE",
	],
};

async function updateExistingUsersPermissions() {
	try {
		console.log("Updating existing users with default permissions...");

		// Get all users
		const users = await prisma.user.findMany({
			select: {
				id: true,
				role: true,
				permissions: true,
			},
		});

		console.log(`Found ${users.length} users`);

		for (const user of users) {
			// Check if user has empty permissions
			if (!user.permissions || user.permissions.length === 0) {
				const permissions = defaultPermissions[user.role] || [];
				await prisma.user.update({
					where: { id: user.id },
					data: { permissions: permissions },
				});
				console.log(
					`Updated user ${user.id} (${user.role}) with ${permissions.length} permissions`
				);
			} else {
				console.log(
					`User ${user.id} already has ${user.permissions.length} permissions`
				);
			}
		}

		console.log("Done!");
	} catch (error) {
		console.error("Error updating users:", error);
	} finally {
		await prisma.$disconnect();
	}
}

updateExistingUsersPermissions();
