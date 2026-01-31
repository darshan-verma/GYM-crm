import { UserRole, Permission } from "@prisma/client";

export function hasPermission(
	userRole: UserRole | undefined,
	requiredRoles: UserRole[]
) {
	if (!userRole) return false;
	return requiredRoles.includes(userRole);
}

export function hasSpecificPermission(
	userPermissions: Permission[] | undefined,
	requiredPermission: Permission
) {
	if (!userPermissions) return false;
	return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
	userPermissions: Permission[] | undefined,
	requiredPermissions: Permission[]
) {
	if (!userPermissions) return false;
	return requiredPermissions.some((permission) =>
		userPermissions.includes(permission)
	);
}

// Role-based permissions
export function requireSuperAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["SUPER_ADMIN"]);
}

export function requireAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN"]);
}

export function requireAdminOrSuperAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN", "SUPER_ADMIN"]);
}

export function requireTrainerOrAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN", "TRAINER", "SUPER_ADMIN"]);
}

export function requireReceptionistOrAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN", "RECEPTIONIST", "SUPER_ADMIN"]);
}

export function requireAnyRole(userRole: UserRole | undefined) {
	return hasPermission(userRole, [
		"SUPER_ADMIN",
		"ADMIN",
		"TRAINER",
		"RECEPTIONIST",
		"HELPER",
		"CUSTOM",
	]);
}

// Default permissions for each role
export function getDefaultPermissionsForRole(role: UserRole): Permission[] {
	switch (role) {
		case "SUPER_ADMIN":
			return [
				Permission.VIEW_DASHBOARD,
				Permission.VIEW_MEMBERS,
				Permission.CREATE_MEMBERS,
				Permission.EDIT_MEMBERS,
				Permission.DELETE_MEMBERS,
				Permission.VIEW_BILLING,
				Permission.CREATE_PAYMENTS,
				Permission.EDIT_PAYMENTS,
				Permission.VIEW_INVOICES,
				Permission.CREATE_INVOICES,
				Permission.VIEW_WORKOUTS,
				Permission.CREATE_WORKOUTS,
				Permission.EDIT_WORKOUTS,
				Permission.DELETE_WORKOUTS,
				Permission.VIEW_DIETS,
				Permission.CREATE_DIETS,
				Permission.EDIT_DIETS,
				Permission.DELETE_DIETS,
				Permission.VIEW_ATTENDANCE,
				Permission.MARK_ATTENDANCE,
				Permission.VIEW_LEADS,
				Permission.CREATE_LEADS,
				Permission.EDIT_LEADS,
				Permission.VIEW_REPORTS,
				Permission.VIEW_STAFF,
				Permission.CREATE_STAFF,
				Permission.EDIT_STAFF,
				Permission.DELETE_STAFF,
				Permission.VIEW_SETTINGS,
				Permission.EDIT_SETTINGS,
			];
		case "ADMIN":
			return [
				Permission.VIEW_DASHBOARD,
				Permission.VIEW_MEMBERS,
				Permission.CREATE_MEMBERS,
				Permission.EDIT_MEMBERS,
				Permission.DELETE_MEMBERS,
				Permission.VIEW_BILLING,
				Permission.CREATE_PAYMENTS,
				Permission.EDIT_PAYMENTS,
				Permission.VIEW_INVOICES,
				Permission.CREATE_INVOICES,
				Permission.VIEW_WORKOUTS,
				Permission.CREATE_WORKOUTS,
				Permission.EDIT_WORKOUTS,
				Permission.DELETE_WORKOUTS,
				Permission.VIEW_DIETS,
				Permission.CREATE_DIETS,
				Permission.EDIT_DIETS,
				Permission.DELETE_DIETS,
				Permission.VIEW_ATTENDANCE,
				Permission.MARK_ATTENDANCE,
				Permission.VIEW_LEADS,
				Permission.CREATE_LEADS,
				Permission.EDIT_LEADS,
				Permission.VIEW_REPORTS,
				Permission.VIEW_STAFF,
				Permission.CREATE_STAFF,
				Permission.EDIT_STAFF,
				Permission.DELETE_STAFF,
				Permission.VIEW_SETTINGS,
				Permission.EDIT_SETTINGS,
			];
		case "TRAINER":
			return [
				Permission.VIEW_DASHBOARD,
				Permission.VIEW_MEMBERS,
				Permission.EDIT_MEMBERS,
				Permission.VIEW_WORKOUTS,
				Permission.CREATE_WORKOUTS,
				Permission.EDIT_WORKOUTS,
				Permission.DELETE_WORKOUTS,
				Permission.VIEW_DIETS,
				Permission.CREATE_DIETS,
				Permission.EDIT_DIETS,
				Permission.DELETE_DIETS,
				Permission.VIEW_ATTENDANCE,
				Permission.MARK_ATTENDANCE,
			];
		case "RECEPTIONIST":
			return [
				Permission.VIEW_DASHBOARD,
				Permission.VIEW_MEMBERS,
				Permission.CREATE_MEMBERS,
				Permission.EDIT_MEMBERS,
				Permission.VIEW_BILLING,
				Permission.CREATE_PAYMENTS,
				Permission.EDIT_PAYMENTS,
				Permission.VIEW_INVOICES,
				Permission.CREATE_INVOICES,
				Permission.VIEW_ATTENDANCE,
				Permission.MARK_ATTENDANCE,
				Permission.VIEW_LEADS,
				Permission.CREATE_LEADS,
				Permission.EDIT_LEADS,
			];
		case "HELPER":
			return [
				Permission.VIEW_DASHBOARD,
				Permission.VIEW_MEMBERS,
				Permission.VIEW_ATTENDANCE,
				Permission.MARK_ATTENDANCE,
			];
		case "CUSTOM":
			// Custom roles use permissions from the Role record or user's permissions
			return [];
		default:
			return [];
	}
}
