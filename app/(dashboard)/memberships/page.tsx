import {
	getMembershipPlans,
	getMembershipPlansForGymProfile,
} from "@/lib/actions/memberships";
import { auth } from "@/lib/auth";
import { requireAdminOrSuperAdmin } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { getGymProfilesPaginated } from "@/lib/actions/gym-profiles";
import GymProfilesMembershipsTable from "@/components/gym-profiles/GymProfilesMembershipsTable";

interface SearchParams {
	gymProfileId?: string;
	search?: string;
	page?: string;
	limit?: string;
}

export default async function MembershipPlansPage({
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
					<h1 className="text-3xl font-bold tracking-tight">
						Membership Plans
					</h1>
					<p className="text-muted-foreground mt-1">
						Select a gym profile to view its membership plans
					</p>
				</div>

				<Card>
					<GymProfilesMembershipsTable
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

	const plans =
		isSuperAdmin && gymProfileId
			? await getMembershipPlansForGymProfile(gymProfileId)
			: await getMembershipPlans();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Membership Plans
					</h1>
					<p className="text-muted-foreground mt-1">
						{isSuperAdmin && gymProfileId
							? `View-only (Super Admin) • Gym: ${gymProfileId}`
							: "Manage your gym membership plans and pricing"}
					</p>
				</div>
				{isSuperAdmin && gymProfileId ? (
					<Button variant="outline" asChild>
						<Link href="/memberships">Back to gyms</Link>
					</Button>
				) : (
					<Button
						asChild
						className="bg-gradient-to-r from-blue-600 to-blue-700"
					>
						<Link href="/memberships/new">
							<Plus className="w-4 h-4 mr-2" />
							Add Plan
						</Link>
					</Button>
				)}
			</div>

			{/* Plans Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{plans.map((plan) => {
					const features = Array.isArray(plan.features)
						? (plan.features as string[])
						: [];

					return (
						<Card
							key={plan.id}
							className={`relative hover:shadow-lg transition-all ${
								plan.popular ? "border-blue-600 border-2" : ""
							}`}
						>
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 -translate-x-1/2">
									<Badge className="bg-blue-600 text-white">Most Popular</Badge>
								</div>
							)}

							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="text-2xl">{plan.name}</CardTitle>
										{plan.description && (
											<CardDescription className="mt-2">
												{plan.description}
											</CardDescription>
										)}
									</div>
								</div>

								<div className="mt-4">
									<div className="flex items-baseline gap-2">
										<span className="text-4xl font-bold">
											{formatCurrency(Number(plan.price))}
										</span>
										<span className="text-muted-foreground">
											/ {plan.duration} days
										</span>
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Features */}
								{features.length > 0 && (
									<div className="space-y-2">
										{features.map((feature: string, index: number) => (
											<div key={index} className="flex items-center gap-2">
												<Check className="w-4 h-4 text-green-600" />
												<span className="text-sm">{feature}</span>
											</div>
										))}
									</div>
								)}

								{/* Actions */}
								{isSuperAdmin && gymProfileId ? null : (
									<div className="pt-4 space-y-2">
										<Button variant="outline" className="w-full" asChild>
											<Link href={`/memberships/${plan.id}/edit`}>Edit Plan</Link>
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>

			{plans.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground mb-4">
							No membership plans yet
						</p>
						<Button asChild>
							<Link href="/memberships/new">
								<Plus className="w-4 h-4 mr-2" />
								Create Your First Plan
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
