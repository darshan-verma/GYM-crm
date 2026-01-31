import { StaffForm } from "@/components/forms/StaffForm";
import { getRoles } from "@/lib/actions/roles";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewStaffPage() {
	const session = await auth();
	const roles = await getRoles();

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
				<h1 className="text-3xl font-bold">Add Staff Member</h1>
				<p className="text-gray-600 mt-1">
					Create a new user account with role and permissions
				</p>
			</div>

			<div className="bg-white p-6 rounded-lg shadow">
				<StaffForm userRole={session?.user?.role} roles={roles} />
			</div>
		</div>
	);
}
