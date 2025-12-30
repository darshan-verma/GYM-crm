import { UserRole } from "@prisma/client";

export function hasPermission(
	userRole: UserRole | undefined,
	requiredRoles: UserRole[]
) {
	if (!userRole) return false;
	return requiredRoles.includes(userRole);
}

export function requireAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN"]);
}

export function requireTrainerOrAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN", "TRAINER"]);
}

export function requireReceptionistOrAdmin(userRole: UserRole | undefined) {
	return hasPermission(userRole, ["ADMIN", "RECEPTIONIST"]);
}
