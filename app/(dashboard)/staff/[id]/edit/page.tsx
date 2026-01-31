import { getUser } from "@/lib/actions/users";
import { getRoles } from "@/lib/actions/roles";
import { auth } from "@/lib/auth";
import { StaffEditForm } from "@/components/forms/StaffEditForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditStaffPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [user, roles] = await Promise.all([getUser(id), getRoles()]);
	const session = await auth();

	if (!user) {
		notFound();
	}

	const roleValue =
		user.role === "CUSTOM" && user.customRoleId
			? `custom:${user.customRoleId}`
			: user.role;

	return (
		<div className="space-y-6">
			<div>
				<Link
					href="/staff"
					className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
				>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Back to Staff
				</Link>
				<h1 className="text-3xl font-bold">Edit Staff Member</h1>
				<p className="text-gray-600 mt-1">
					Update user details, role, or change password
				</p>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<StaffEditForm
					userId={id}
					initialData={{
						id: user.id,
						name: user.name,
						email: user.email,
						role: roleValue,
						permissions: user.permissions || [],
						phone: user.phone || "",
					}}
					currentUserRole={session?.user?.role}
					roles={roles}
				/>
			</div>
		</div>
	);
}
