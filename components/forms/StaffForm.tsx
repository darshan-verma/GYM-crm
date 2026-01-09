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
import { createUser } from "@/lib/actions/users";
import { UserRole, Permission } from "@prisma/client";
import { getDefaultPermissionsForRole } from "@/lib/utils/permissions";

interface StaffFormProps {
	userRole?: UserRole;
}

export function StaffForm({ userRole }: StaffFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState(() => {
		const defaultRole = (
			userRole === "SUPER_ADMIN" ? "RECEPTIONIST" : "TRAINER"
		) as "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "RECEPTIONIST" | "HELPER";
		const defaultPermissions = getDefaultPermissionsForRole(defaultRole);
		return {
			name: "",
			email: "",
			role: defaultRole,
			permissions: defaultPermissions,
			phone: "",
			password: "",
			confirmPassword: "",
		};
	});

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

		// Validate passwords
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

		const result = await createUser({
			name: formData.name,
			email: formData.email,
			role: formData.role,
			permissions: formData.permissions,
			phone: formData.phone || undefined,
			password: formData.password,
		});

		if (result.success) {
			router.push("/staff");
			router.refresh();
		} else {
			setError(result.error || "Something went wrong");
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
				<Select
					value={formData.role}
					onValueChange={(value) => {
						const newRole = value as
							| "SUPER_ADMIN"
							| "ADMIN"
							| "TRAINER"
							| "RECEPTIONIST"
							| "HELPER";
						const defaultPermissions = getDefaultPermissionsForRole(newRole);
						setFormData((prev) => ({
							...prev,
							role: newRole,
							permissions: defaultPermissions,
						}));
					}}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{userRole === "SUPER_ADMIN" && (
							<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
						)}
						{userRole === "SUPER_ADMIN" && (
							<SelectItem value="ADMIN">Admin</SelectItem>
						)}
						<SelectItem value="TRAINER">Trainer</SelectItem>
						<SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
						<SelectItem value="HELPER">Helper</SelectItem>
					</SelectContent>
				</Select>
				<p className="text-sm text-gray-500">
					{formData.role === "SUPER_ADMIN" &&
						"Complete system access including user management"}
					{formData.role === "ADMIN" && "Full access to all features"}
					{formData.role === "TRAINER" &&
						"Can manage members, workouts, and attendance"}
					{formData.role === "RECEPTIONIST" &&
						"Can manage members, attendance, and payments"}
					{formData.role === "HELPER" && "Basic access for support tasks"}
				</p>
			</div>

			<div className="space-y-4">
				<Label>Permissions *</Label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
					{/* Dashboard */}
					<div className="space-y-2">
						<h4 className="font-medium text-sm">Dashboard</h4>
						<div className="flex items-center space-x-2">
							<Checkbox
								id="view-dashboard"
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
							<Label htmlFor="view-dashboard" className="text-sm">
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
									id="view-members"
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
								<Label htmlFor="view-members" className="text-sm">
									View Members
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="create-members"
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
								<Label htmlFor="create-members" className="text-sm">
									Create Members
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-members"
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
								<Label htmlFor="edit-members" className="text-sm">
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
									id="view-billing"
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
								<Label htmlFor="view-billing" className="text-sm">
									View Billing
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="create-payments"
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
								<Label htmlFor="create-payments" className="text-sm">
									Create Payments
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="view-invoices"
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
								<Label htmlFor="view-invoices" className="text-sm">
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
									id="view-workouts"
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
								<Label htmlFor="view-workouts" className="text-sm">
									View Workouts
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="create-workouts"
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
								<Label htmlFor="create-workouts" className="text-sm">
									Create Workouts
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-workouts"
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
								<Label htmlFor="edit-workouts" className="text-sm">
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
									id="view-diets"
									checked={formData.permissions.includes(Permission.VIEW_DIETS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_DIETS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="view-diets" className="text-sm">
									View Diets
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="create-diets"
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
								<Label htmlFor="create-diets" className="text-sm">
									Create Diets
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-diets"
									checked={formData.permissions.includes(Permission.EDIT_DIETS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.EDIT_DIETS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-diets" className="text-sm">
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
									id="view-attendance"
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
								<Label htmlFor="view-attendance" className="text-sm">
									View Attendance
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="mark-attendance"
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
								<Label htmlFor="mark-attendance" className="text-sm">
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
									id="view-leads"
									checked={formData.permissions.includes(Permission.VIEW_LEADS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.VIEW_LEADS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="view-leads" className="text-sm">
									View Leads
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="create-leads"
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
								<Label htmlFor="create-leads" className="text-sm">
									Create Leads
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="edit-leads"
									checked={formData.permissions.includes(Permission.EDIT_LEADS)}
									onCheckedChange={(checked) =>
										handlePermissionChange(
											Permission.EDIT_LEADS,
											checked as boolean
										)
									}
								/>
								<Label htmlFor="edit-leads" className="text-sm">
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
								id="view-reports"
								checked={formData.permissions.includes(Permission.VIEW_REPORTS)}
								onCheckedChange={(checked) =>
									handlePermissionChange(
										Permission.VIEW_REPORTS,
										checked as boolean
									)
								}
							/>
							<Label htmlFor="view-reports" className="text-sm">
								View Reports
							</Label>
						</div>
					</div>

					{/* Staff Management - Only for super admin */}
					{userRole === "SUPER_ADMIN" && (
						<div className="space-y-2">
							<h4 className="font-medium text-sm">Staff Management</h4>
							<div className="space-y-1">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="view-staff"
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
									<Label htmlFor="view-staff" className="text-sm">
										View Staff
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="create-staff"
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
									<Label htmlFor="create-staff" className="text-sm">
										Create Staff
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-staff"
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
									<Label htmlFor="edit-staff" className="text-sm">
										Edit Staff
									</Label>
								</div>
							</div>
						</div>
					)}

					{/* Settings - Only for super admin */}
					{userRole === "SUPER_ADMIN" && (
						<div className="space-y-2">
							<h4 className="font-medium text-sm">Settings</h4>
							<div className="space-y-1">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="view-settings"
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
									<Label htmlFor="view-settings" className="text-sm">
										View Settings
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-settings"
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
									<Label htmlFor="edit-settings" className="text-sm">
										Edit Settings
									</Label>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="border-t pt-4">
				<h3 className="text-lg font-medium mb-4">Password *</h3>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">Password *</Label>
						<Input
							id="password"
							type="password"
							value={formData.password}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, password: e.target.value }))
							}
							placeholder="••••••••"
							required
							minLength={6}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password *</Label>
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
							required
							minLength={6}
						/>
					</div>
				</div>
			</div>

			<div className="flex gap-3 pt-4">
				<Button type="submit" disabled={loading}>
					{loading ? "Saving..." : "Create User"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/staff")}
					disabled={loading}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
