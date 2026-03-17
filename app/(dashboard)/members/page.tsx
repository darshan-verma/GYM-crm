import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getGymProfilesPaginated } from "@/lib/actions/gym-profiles";
import {
	getMembers,
	getMembersForGymProfile,
	getTrainers,
	getTrainersForGymProfile,
} from "@/lib/actions/members";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import MembersTable from "@/components/members/MembersTable";
import GymProfilesMembersTable from "@/components/gym-profiles/GymProfilesMembersTable";

interface SearchParams {
	gymProfileId?: string;
	search?: string;
	status?: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "PENDING";
	trainerId?: string;
	page?: string;
	limit?: string;
}

export default async function MembersPage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const params = await searchParams;
	const session = await auth();
	const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

	const gymProfileId = params.gymProfileId?.trim() || null;
	const page = params.page ? parseInt(params.page, 10) : 1;
	const limit = params.limit ? parseInt(params.limit, 10) : 20;

	if (isSuperAdmin && !gymProfileId) {
		const gyms = await getGymProfilesPaginated({
			search: params.search,
			page: Number.isFinite(page) && page > 0 ? page : 1,
			limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
		});

		const serializedGyms = JSON.parse(
			JSON.stringify(gyms.profiles)
		) as typeof gyms.profiles;

		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Members</h1>
					<p className="text-muted-foreground mt-1">
						Select a gym profile to view its members
					</p>
				</div>

				<Card>
					<GymProfilesMembersTable
						profiles={serializedGyms}
						total={gyms.total}
						currentPage={gyms.currentPage}
						totalPages={gyms.pages}
						limit={limit}
					/>
				</Card>
			</div>
		);
	}

	const [membersData, trainers] = await Promise.all([
		isSuperAdmin && gymProfileId
			? getMembersForGymProfile({
					gymProfileId,
					search: params.search,
					status: params.status,
					trainerId: params.trainerId,
					page: Number.isFinite(page) && page > 0 ? page : 1,
					limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
				})
			: getMembers({
					search: params.search,
					status: params.status,
					trainerId: params.trainerId,
					page: params.page ? parseInt(params.page) : 1,
					limit: 20,
				}),
		isSuperAdmin && gymProfileId
			? getTrainersForGymProfile(gymProfileId)
			: getTrainers(),
	]);

	// Serialize the data to convert Decimal objects to plain numbers
	const serializedMembers = JSON.parse(
		JSON.stringify(membersData.members)
	) as typeof membersData.members;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Members</h1>
					<p className="text-muted-foreground mt-1">
						{isSuperAdmin && gymProfileId
							? `View-only (Super Admin) • Gym: ${gymProfileId}`
							: "Manage your gym members and memberships"}
					</p>
				</div>
				{isSuperAdmin && gymProfileId ? (
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href="/members">Back to gyms</Link>
						</Button>
					</div>
				) : (
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href="/api/export/members">
								<Download className="w-4 h-4 mr-2" />
								Export
							</Link>
						</Button>
						<Button
							asChild
							className="bg-gradient-to-r from-blue-600 to-blue-700"
						>
							<Link href="/members/new">
								<Plus className="w-4 h-4 mr-2" />
								Add Member
							</Link>
						</Button>
					</div>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">Total Members</div>
					<div className="text-2xl font-bold mt-1">{membersData.total}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">Active</div>
					<div className="text-2xl font-bold mt-1 text-green-600">
						{serializedMembers.filter((m) => m.status === "ACTIVE").length}
					</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">Expired</div>
					<div className="text-2xl font-bold mt-1 text-red-600">
						{serializedMembers.filter((m) => m.status === "EXPIRED").length}
					</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-muted-foreground">Pending</div>
					<div className="text-2xl font-bold mt-1 text-orange-600">
						{serializedMembers.filter((m) => m.status === "PENDING").length}
					</div>
				</Card>
			</div>

			{/* Members Table */}
			<Card>
				<Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
					<MembersTable
						members={serializedMembers}
						trainers={trainers}
						total={membersData.total}
						currentPage={membersData.currentPage}
						totalPages={membersData.pages}
						readOnly={isSuperAdmin && !!gymProfileId}
					/>
				</Suspense>
			</Card>
		</div>
	);
}
