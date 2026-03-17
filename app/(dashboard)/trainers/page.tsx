import { getTrainers, getTrainersForGymProfile } from "@/lib/actions/trainers";
import { auth } from "@/lib/auth";
import { requireAdminOrSuperAdmin } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/utils/format";
import { getGymProfilesPaginated } from "@/lib/actions/gym-profiles";
import GymProfilesTrainersTable from "@/components/gym-profiles/GymProfilesTrainersTable";

interface SearchParams {
	gymProfileId?: string;
	search?: string;
	page?: string;
	limit?: string;
}

export default async function TrainersPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await auth();

	if (!requireAdminOrSuperAdmin(session?.user?.role)) {
		redirect("/");
	}

	const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

	const params = await searchParams;
	const gymProfileId = params?.gymProfileId?.trim() || null;
	const page = params?.page ? parseInt(params.page, 10) : 1;
	const limit = params?.limit ? parseInt(params.limit, 10) : 20;

	if (isSuperAdmin && !gymProfileId) {
		const gyms = await getGymProfilesPaginated({
			search: params?.search,
			page: Number.isFinite(page) && page > 0 ? page : 1,
			limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
		});

		const serializedGyms = JSON.parse(
			JSON.stringify(gyms.profiles)
		) as typeof gyms.profiles;

		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
					<p className="text-muted-foreground mt-1">
						Select a gym profile to view its trainers
					</p>
				</div>

				<Card>
					<GymProfilesTrainersTable
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

	const trainers =
		isSuperAdmin && gymProfileId
			? await getTrainersForGymProfile(gymProfileId)
			: await getTrainers();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
					<p className="text-muted-foreground mt-1">
						{isSuperAdmin && gymProfileId
							? `View-only (Super Admin) • Gym: ${gymProfileId}`
							: "Manage your gym trainers and their assigned members"}
					</p>
				</div>
				{isSuperAdmin && gymProfileId ? (
					<Button variant="outline" asChild>
						<Link href="/trainers">Back to gyms</Link>
					</Button>
				) : (
					<Button
						asChild
						className="bg-gradient-to-r from-blue-600 to-blue-700"
					>
						<Link href="/trainers/new">
							<Plus className="w-4 h-4 mr-2" />
							Add Trainer
						</Link>
					</Button>
				)}
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-blue-100">
								<Users className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Total Trainers</p>
								<p className="text-2xl font-bold">{trainers.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-green-100">
								<Users className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Active Trainers</p>
								<p className="text-2xl font-bold">
									{trainers.filter((t) => t._count.trainedMembers > 0).length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-purple-100">
								<Users className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Total Members Trained
								</p>
								<p className="text-2xl font-bold">
									{trainers.reduce(
										(sum, t) => sum + t._count.trainedMembers,
										0
									)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Trainers Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{trainers.map((trainer) => (
					<Card key={trainer.id} className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<Avatar className="h-12 w-12">
										<AvatarImage src={trainer.avatar || undefined} />
										<AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
											{trainer.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle className="text-lg">{trainer.name}</CardTitle>
										<Badge
											variant="outline"
											className="mt-1 bg-blue-50 text-blue-700 border-blue-200"
										>
											Trainer
										</Badge>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Contact Info */}
							<div className="space-y-2">
								{trainer.email && (
									<div className="flex items-center gap-2 text-sm">
										<Mail className="w-4 h-4 text-muted-foreground" />
										<span className="truncate">{trainer.email}</span>
									</div>
								)}
								{trainer.phone && (
									<div className="flex items-center gap-2 text-sm">
										<Phone className="w-4 h-4 text-muted-foreground" />
										<span>{formatPhoneNumber(trainer.phone)}</span>
									</div>
								)}
							</div>

							{/* Stats */}
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">Members</p>
									<p className="text-xl font-bold">
										{trainer._count.trainedMembers}
									</p>
								</div>
							</div>

							{/* Actions */}
							{isSuperAdmin && gymProfileId ? null : (
								<Button variant="outline" className="w-full" asChild>
									<Link href={`/trainers/${trainer.id}`}>View Profile</Link>
								</Button>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{trainers.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-4">No trainers added yet</p>
						<Button asChild>
							<Link href="/trainers/new">
								<Plus className="w-4 h-4 mr-2" />
								Add Your First Trainer
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
