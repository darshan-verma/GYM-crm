"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUser, deleteUser } from "@/lib/actions/users";
import { createRole, type RoleWithPermissions } from "@/lib/actions/roles";
import { Permission } from "@prisma/client";
import { getDefaultPermissionsForRole } from "@/lib/utils/permissions";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type SystemRole = "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "RECEPTIONIST" | "HELPER";

interface StaffEditFormProps {
	userId: string;
	initialData: {
		id: string;
		name: string;
		email: string;
		role: string; // system role or "custom:roleId"
		permissions: Permission[];
		phone?: string;
	};
	currentUserRole?:
		| "SUPER_ADMIN"
		| "ADMIN"
		| "TRAINER"
		| "RECEPTIONIST"
		| "HELPER"
		| "CUSTOM";
	roles: RoleWithPermissions[];
}

export function StaffEditForm({
	userId,
	initialData,
	currentUserRole,
	roles: initialRoles,
}: StaffEditFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [rolesList, setRolesList] = useState<RoleWithPermissions[]>(initialRoles);
	const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
	const [newRole, setNewRole] = useState({
		name: "",
		description: "",
		defaultPermissions: [] as Permission[],
	});

	const getPermissionsForRoleValue = (roleValue: string): Permission[] => {
		if (roleValue.startsWith("custom:")) {
			const roleId = roleValue.slice(7);
			const role = rolesList.find((r) => r.id === roleId);
			return role?.defaultPermissions ?? [];
		}
		return getDefaultPermissionsForRole(roleValue as SystemRole);
	};

	const [formData, setFormData] = useState(() => {
		const permissions =
			initialData.permissions && initialData.permissions.length > 0
				? initialData.permissions
				: initialData.role.startsWith("custom:")
					? (initialRoles.find((r) => `custom:${r.id}` === initialData.role)
							?.defaultPermissions ?? [])
					: getDefaultPermissionsForRole(initialData.role as SystemRole);
		return {
			name: initialData.name,
			email: initialData.email,
			role: initialData.role,
			permissions,
			phone: initialData.phone || "",
			password: "",
			confirmPassword: "",
		};
	});

	const handleAddRole = async () => {
		if (!newRole.name.trim()) {
			toast.error("Please enter a role name");
			return;
		}
		try {
			const created = await createRole({
				name: newRole.name.trim(),
				description: newRole.description.trim() || undefined,
				defaultPermissions: newRole.defaultPermissions,
			});
			setRolesList((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
			setFormData((prev) => ({
				...prev,
				role: `custom:${created.id}`,
				permissions: created.defaultPermissions,
			}));
			setNewRole({ name: "", description: "", defaultPermissions: [] });
			setNewRoleDialogOpen(false);
			toast.success("Role added successfully");
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Failed to add role"
			);
		}
	};

	const handleNewRolePermissionChange = (permission: Permission, checked: boolean) => {
		setNewRole((prev) => ({
			...prev,
			defaultPermissions: checked
				? [...prev.defaultPermissions, permission]
				: prev.defaultPermissions.filter((p) => p !== permission),
		}));
	};

	const handlePermissionChange = (permission: Permission, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			permissions: checked
				? [...prev.permissions, permission]
				: prev.permissions.filter((p) => p !== permission),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validate passwords if provided
		if (formData.password) {
			if (formData.password !== formData.confirmPassword) {
				setError("Passwords do not match");
				setLoading(false);
				return;
			}

			if (formData.password.length < 6) {
				setError("Password must be at least 6 characters");
				setLoading(false);
				return;
			}
		}

		const isCustomRole = formData.role.startsWith("custom:");
		const roleToSave = isCustomRole ? "CUSTOM" : (formData.role as SystemRole);
		const customRoleId = isCustomRole ? formData.role.slice(7) : undefined;

		const submitData: {
			name: string;
			email: string;
			role: SystemRole | "CUSTOM";
			permissions: Permission[];
			phone?: string;
			password?: string;
			customRoleId?: string | null;
		} = {
			name: formData.name,
			email: formData.email,
			role: roleToSave,
			permissions: formData.permissions,
			phone: formData.phone || undefined,
			customRoleId: isCustomRole ? customRoleId : null,
		};

		// Only include password if provided
		if (formData.password) {
			submitData.password = formData.password;
		}

		const result = await updateUser(userId, submitData);

		if (result.success) {
			router.push("/staff");
			router.refresh();
		} else {
			setError(result.error || "Something went wrong");
		}
		setLoading(false);
	};

	const handleDelete = async () => {
		if (
			!confirm(
				"Are you sure you want to delete this user? This action cannot be undone."
			)
		) {
			return;
		}

		setLoading(true);
		setError("");

		const result = await deleteUser(userId);

		if (result.success) {
			router.push("/staff");
			router.refresh();
		} else {
			setError(result.error || "Failed to delete user");
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
					{error}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor="name">Full Name *</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, name: e.target.value }))
					}
					placeholder="John Doe"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email *</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, email: e.target.value }))
					}
					placeholder="john@example.com"
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="phone">Phone</Label>
				<Input
					id="phone"
					type="tel"
					value={formData.phone}
					onChange={(e) =>
						setFormData((prev) => ({ ...prev, phone: e.target.value }))
					}
					placeholder="+1234567890"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="role">Role *</Label>
				<div className="flex gap-2">
					<Select
						value={formData.role}
						onValueChange={(value) => {
							const defaultPermissions = getPermissionsForRoleValue(value);
							setFormData((prev) => ({
								...prev,
								role: value,
								permissions: defaultPermissions,
							}));
						}}
					>
						<SelectTrigger className="w-64">
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							{currentUserRole === "SUPER_ADMIN" && (
								<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
							)}
							{currentUserRole === "SUPER_ADMIN" && (
								<SelectItem value="ADMIN">Admin</SelectItem>
							)}
							<SelectItem value="TRAINER">Trainer</SelectItem>
							<SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
							<SelectItem value="HELPER">Helper</SelectItem>
							{rolesList.map((r) => (
								<SelectItem key={r.id} value={`custom:${r.id}`}>
									{r.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Dialog open={newRoleDialogOpen} onOpenChange={setNewRoleDialogOpen}>
						<DialogTrigger asChild>
							<Button type="button" variant="outline" size="sm">
								<Plus className="h-4 w-4 mr-1" />
								New
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Add New Role</DialogTitle>
								<DialogDescription>
									Create a custom role with a name and default permissions. It will appear in the role dropdown.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="edit-newRoleName">Role Name *</Label>
									<Input
										id="edit-newRoleName"
										value={newRole.name}
										onChange={(e) =>
											setNewRole((prev) => ({ ...prev, name: e.target.value }))
										}
										placeholder="e.g. Sales, Front Desk"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-newRoleDescription">Description (optional)</Label>
									<Input
										id="edit-newRoleDescription"
										value={newRole.description}
										onChange={(e) =>
											setNewRole((prev) => ({ ...prev, description: e.target.value }))
										}
										placeholder="Brief description of this role"
									/>
								</div>
								<div className="space-y-2">
									<Label>Default Permissions</Label>
									<p className="text-sm text-gray-500">
										Select the permissions that will be pre-checked when this role is assigned.
									</p>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
										{Object.values(Permission).map((perm) => (
											<div key={perm} className="flex items-center space-x-2">
												<Checkbox
													id={`edit-new-role-${perm}`}
													checked={newRole.defaultPermissions.includes(perm)}
													onCheckedChange={(checked) =>
														handleNewRolePermissionChange(perm, checked as boolean)
													}
												/>
												<Label htmlFor={`edit-new-role-${perm}`} className="text-sm font-normal">
													{perm.replace(/_/g, " ")}
												</Label>
											</div>
										))}
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										setNewRole({ name: "", description: "", defaultPermissions: [] })
									}
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={handleAddRole}
									disabled={!newRole.name.trim()}
								>
									Add Role
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
				<p className="text-sm text-gray-500">
					{formData.role === "SUPER_ADMIN" &&
						"Complete system access including user management"}
					{formData.role === "ADMIN" && "Full access to all features"}
					{formData.role === "TRAINER" &&
						"Can manage members, workouts, and attendance"}
					{formData.role === "RECEPTIONIST" &&
						"Can manage members, attendance, and payments"}
					{formData.role === "HELPER" && "Basic access for support tasks"}
					{formData.role.startsWith("custom:") &&
						rolesList.find((r) => `custom:${r.id}` === formData.role)?.description}
					{formData.role.startsWith("custom:") &&
						!rolesList.find((r) => `custom:${r.id}` === formData.role)?.description &&
						"Custom role — adjust permissions below."}
				</p>
			</div>

			<div className="space-y-4">
				<Label>Permissions *</Label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
					{/* Dashboard */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Dashboard</h4>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="edit-view-dashboard"
								checked={formData.permissions.includes(
									Permission.VIEW_DASHBOARD
								)}
								onCheckedChange={(checked) =>
									handlePermissionChange(
										Permission.VIEW_DASHBOARD,
										checked as boolean
									)
								}
							/>
							<Label htmlFor="edit-view-dashboard" className="text-sm">
								View Dashboard
							</Label>
						</div>
					</div>

					{/* Members */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Members</h4>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-members"
									checked={formData.permissions.includes(
										Permission.VIEW_MEMBERS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_MEMBERS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-members" className="text-sm">
									View Members
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-create-members"
									checked={formData.permissions.includes(
										Permission.CREATE_MEMBERS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.CREATE_MEMBERS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-create-members" className="text-sm">
									Create Members
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-edit-members"
									checked={formData.permissions.includes(
										Permission.EDIT_MEMBERS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.EDIT_MEMBERS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-edit-members" className="text-sm">
									Edit Members
								</Label>
							</div>
						</div>
					</div>

					{/* Billing */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Billing</h4>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-billing"
									checked={formData.permissions.includes(
										Permission.VIEW_BILLING
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_BILLING,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-billing" className="text-sm">
									View Billing
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-create-payments"
									checked={formData.permissions.includes(
										Permission.CREATE_PAYMENTS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.CREATE_PAYMENTS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-create-payments" className="text-sm">
									Create Payments
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-invoices"
									checked={formData.permissions.includes(
										Permission.VIEW_INVOICES
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_INVOICES,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-invoices" className="text-sm">
									View Invoices
								</Label>
							</div>
						</div>
					</div>

					{/* Workouts */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Workouts</h4>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-workouts"
									checked={formData.permissions.includes(
										Permission.VIEW_WORKOUTS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_WORKOUTS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-workouts" className="text-sm">
									View Workouts
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-create-workouts"
									checked={formData.permissions.includes(
										Permission.CREATE_WORKOUTS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.CREATE_WORKOUTS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-create-workouts" className="text-sm">
									Create Workouts
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-edit-workouts"
									checked={formData.permissions.includes(
										Permission.EDIT_WORKOUTS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.EDIT_WORKOUTS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-edit-workouts" className="text-sm">
									Edit Workouts
								</Label>
							</div>
						</div>
					</div>

					{/* Diets */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Diets</h4>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-diets"
									checked={formData.permissions.includes(Permission.VIEW_DIETS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_DIETS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-diets" className="text-sm">
									View Diets
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-create-diets"
									checked={formData.permissions.includes(
										Permission.CREATE_DIETS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.CREATE_DIETS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-create-diets" className="text-sm">
									Create Diets
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-edit-diets"
									checked={formData.permissions.includes(Permission.EDIT_DIETS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.EDIT_DIETS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-edit-diets" className="text-sm">
									Edit Diets
								</Label>
							</div>
						</div>
					</div>

					{/* Attendance */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Attendance</h4>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-attendance"
									checked={formData.permissions.includes(
										Permission.VIEW_ATTENDANCE
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_ATTENDANCE,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-attendance" className="text-sm">
									View Attendance
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-mark-attendance"
									checked={formData.permissions.includes(
										Permission.MARK_ATTENDANCE
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.MARK_ATTENDANCE,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-mark-attendance" className="text-sm">
									Mark Attendance
								</Label>
							</div>
						</div>
					</div>

					{/* Leads */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Leads</h4>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-view-leads"
									checked={formData.permissions.includes(Permission.VIEW_LEADS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_LEADS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-view-leads" className="text-sm">
									View Leads
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-create-leads"
									checked={formData.permissions.includes(
										Permission.CREATE_LEADS
									)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.CREATE_LEADS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-create-leads" className="text-sm">
									Create Leads
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-edit-leads"
									checked={formData.permissions.includes(Permission.EDIT_LEADS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.EDIT_LEADS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-edit-leads" className="text-sm">
									Edit Leads
								</Label>
							</div>
						</div>
					</div>

					{/* Reports */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Reports</h4>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="edit-view-reports"
								checked={formData.permissions.includes(Permission.VIEW_REPORTS)}
								onCheckedChange={(checked) =>
									handlePermissionChange(
										Permission.VIEW_REPORTS,
										checked as boolean
									)
								}
							/>
							<Label htmlFor="edit-view-reports" className="text-sm">
								View Reports
							</Label>
						</div>
					</div>

					{/* Staff Management - Only for super admin */}
					{currentUserRole === "SUPER_ADMIN" && (
						<div className="space-y-2">
							<h4 className="font-medium text-sm">Staff Management</h4>
							<div className="space-y-1">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-view-staff"
										checked={formData.permissions.includes(
											Permission.VIEW_STAFF
										)}
										onCheckedChange={(checked) =>
											handlePermissionChange(
												Permission.VIEW_STAFF,
												checked as boolean
											)
										}
									/>
									<Label htmlFor="edit-view-staff" className="text-sm">
										View Staff
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-create-staff"
										checked={formData.permissions.includes(
											Permission.CREATE_STAFF
										)}
										onCheckedChange={(checked) =>
											handlePermissionChange(
												Permission.CREATE_STAFF,
												checked as boolean
											)
										}
									/>
									<Label htmlFor="edit-create-staff" className="text-sm">
										Create Staff
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-edit-staff"
										checked={formData.permissions.includes(
											Permission.EDIT_STAFF
										)}
										onCheckedChange={(checked) =>
											handlePermissionChange(
												Permission.EDIT_STAFF,
												checked as boolean
											)
										}
									/>
									<Label htmlFor="edit-edit-staff" className="text-sm">
										Edit Staff
									</Label>
								</div>
							</div>
						</div>
					)}

					{/* Settings - Only for super admin */}
					{currentUserRole === "SUPER_ADMIN" && (
						<div className="space-y-2">
							<h4 className="font-medium text-sm">Settings</h4>
							<div className="space-y-1">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-view-settings"
										checked={formData.permissions.includes(
											Permission.VIEW_SETTINGS
										)}
										onCheckedChange={(checked) =>
											handlePermissionChange(
												Permission.VIEW_SETTINGS,
												checked as boolean
											)
										}
									/>
									<Label htmlFor="edit-view-settings" className="text-sm">
										View Settings
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-edit-settings"
										checked={formData.permissions.includes(
											Permission.EDIT_SETTINGS
										)}
										onCheckedChange={(checked) =>
											handlePermissionChange(
												Permission.EDIT_SETTINGS,
												checked as boolean
											)
										}
									/>
									<Label htmlFor="edit-edit-settings" className="text-sm">
										Edit Settings
									</Label>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="border-t pt-4">
				<h3 className="text-lg font-medium mb-4">Change Password (optional)</h3>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">New Password</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, password: e.target.value }))
							}
							placeholder="••••••••"
							minLength={6}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm New Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									confirmPassword: e.target.value,
								}))
							}
							placeholder="••••••••"
							minLength={6}
						/>
					</div>
				</div>
			</div>

			<div className="flex gap-3 pt-4">
				<Button type="submit" disabled={loading}>
					{loading ? "Saving..." : "Save Changes"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/staff")}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={handleDelete}
					disabled={loading}
					className="ml-auto"
				>
					Delete User
				</Button>
			</div>
		</form>
	);
}
