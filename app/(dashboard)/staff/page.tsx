import { getUsers } from "@/lib/actions/users";
import { auth } from "@/lib/auth";
import { requireAdminOrSuperAdmin } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	Plus,
	Mail,
	Phone,
	Shield,
	User,
	Briefcase,
	Crown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaffUser {
	id: string;
	name: string;
	email: string;
	role: string;
	customRole?: { id: string; name: string } | null;
	phone?: string | null;
	createdAt: Date;
}

export default async function StaffPage() {
	const session = await auth();

	if (!requireAdminOrSuperAdmin(session?.user?.role)) {
		redirect("/");
	}

	const users = await getUsers();

	const getRoleBadge = (user: StaffUser) => {
		const role = user.role;
		const customName = user.customRole?.name;
		if (role === "CUSTOM" && customName) {
			return (
				<Badge variant="secondary" className="bg-slate-100 text-slate-800">
					<User className="h-3 w-3 mr-1" />
					{customName}
				</Badge>
			);
		}
		switch (role) {
			case "SUPER_ADMIN":
				return (
					<Badge className="bg-red-100 text-red-800">
						<Crown className="h-3 w-3 mr-1" />
						Super Admin
					</Badge>
				);
			case "ADMIN":
				return (
					<Badge className="bg-purple-100 text-purple-800">
						<Shield className="h-3 w-3 mr-1" />
						Admin
					</Badge>
				);
			case "TRAINER":
				return (
					<Badge className="bg-blue-100 text-blue-800">
						<Briefcase className="h-3 w-3 mr-1" />
						Trainer
					</Badge>
				);
			case "RECEPTIONIST":
				return (
					<Badge className="bg-green-100 text-green-800">
						<User className="h-3 w-3 mr-1" />
						Receptionist
					</Badge>
				);
			case "HELPER":
				return (
					<Badge className="bg-orange-100 text-orange-800">
						<User className="h-3 w-3 mr-1" />
						Helper
					</Badge>
				);
			default:
				return <Badge>{customName || role}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Staff Management</h1>
					<p className="text-gray-600 mt-1">
						Manage system users and their roles
					</p>
				</div>
				<Link href="/staff/new">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Add Staff Member
					</Button>
				</Link>
			</div>

			{users.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<div className="max-w-sm mx-auto">
						<User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No staff members yet</h3>
						<p className="text-gray-600 mb-6">
							Get started by adding your first staff member
						</p>
						<Link href="/staff/new">
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Add Staff Member
							</Button>
						</Link>
					</div>
				</div>
			) : (
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Contact
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Role
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Created
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{users.map((user: StaffUser) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="font-medium text-gray-900">{user.name}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex flex-col gap-1">
											<div className="flex items-center text-sm text-gray-600">
												<Mail className="h-3 w-3 mr-1" />
												{user.email}
											</div>
											{user.phone && (
												<div className="flex items-center text-sm text-gray-600">
													<Phone className="h-3 w-3 mr-1" />
													{user.phone}
												</div>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{getRoleBadge(user)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{new Date(user.createdAt).toLocaleDateString()}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<Link href={`/staff/${user.id}/edit`}>
											<Button variant="ghost" size="sm">
												Edit
											</Button>
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h3 className="font-semibold text-blue-900 mb-2">Role Permissions</h3>
				<ul className="space-y-1 text-sm text-blue-800">
					<li>
						<strong>Super Admin:</strong> Complete system access including user
						management and system configuration
					</li>
					<li>
						<strong>Admin:</strong> Full access to all features including
						settings and user management
					</li>
					<li>
						<strong>Trainer:</strong> Can manage members, workouts, diet plans,
						and attendance
					</li>
					<li>
						<strong>Receptionist:</strong> Can manage members, attendance,
						payments, and leads
					</li>
					<li>
						<strong>Helper:</strong> Basic access for support tasks including
						viewing members and marking attendance
					</li>
				</ul>
			</div>
		</div>
	);
}
