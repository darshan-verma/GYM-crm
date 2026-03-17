import {
	getPayments,
	getPaymentStats,
	getPaymentsForGymProfile,
	getPaymentStatsForGymProfile,
} from "@/lib/actions/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Plus,
	Download,
	IndianRupee,
	TrendingUp,
	CreditCard,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";
import { auth } from "@/lib/auth";
import { getGymProfilesPaginated } from "@/lib/actions/gym-profiles";
import GymProfilesBillingTable from "@/components/gym-profiles/GymProfilesBillingTable";

interface SearchParams {
	gymProfileId?: string;
	search?: string;
	page?: string;
	limit?: string;
}

export default async function BillingPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const session = await auth();
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
						Billing & Payments
					</h1>
					<p className="text-muted-foreground mt-1">
						Select a gym profile to view its billing
					</p>
				</div>

				<Card>
					<GymProfilesBillingTable
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

	const [paymentsData, stats] = await Promise.all([
		isSuperAdmin && gymProfileId
			? getPaymentsForGymProfile({ gymProfileId, limit: 10 })
			: getPayments({ limit: 10 }),
		isSuperAdmin && gymProfileId
			? getPaymentStatsForGymProfile(gymProfileId, "month")
			: getPaymentStats("month"),
	]);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Billing & Payments
					</h1>
					<p className="text-muted-foreground mt-1">
						{isSuperAdmin && gymProfileId
							? `View-only (Super Admin) • Gym: ${gymProfileId}`
							: "Manage payments, invoices, and revenue"}
					</p>
				</div>
				{isSuperAdmin && gymProfileId ? (
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href="/billing">Back to gyms</Link>
						</Button>
					</div>
				) : (
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href="/api/export/payments">
								<Download className="w-4 h-4 mr-2" />
								Export
							</Link>
						</Button>
						<Button
							asChild
							className="bg-gradient-to-r from-green-600 to-green-700"
						>
							<Link href="/billing/payments/new">
								<Plus className="w-4 h-4 mr-2" />
								Record Payment
							</Link>
						</Button>
					</div>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Revenue (This Month)
						</CardTitle>
						<div className="p-2 rounded-lg bg-green-500/10 text-green-700">
							<IndianRupee className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(stats.totalRevenue)}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{stats.totalTransactions} transactions
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Average Transaction
						</CardTitle>
						<div className="p-2 rounded-lg bg-blue-500/10 text-blue-700">
							<TrendingUp className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(stats.averageTransaction)}
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Payments
						</CardTitle>
						<div className="p-2 rounded-lg bg-orange-500/10 text-orange-700">
							<CreditCard className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{paymentsData.total}</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Payments */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Recent Payments</CardTitle>
						{isSuperAdmin && gymProfileId ? null : (
							<Button variant="outline" asChild>
								<Link href="/billing/payments">View All</Link>
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{paymentsData.payments.slice(0, 10).map((payment) =>
							isSuperAdmin && gymProfileId ? (
								<div
									key={payment.id}
									className="flex items-center justify-between p-4 rounded-lg border"
								>
									<div className="flex-1">
										<p className="font-medium">{payment.member.name}</p>
										<p className="text-sm text-muted-foreground">
											{payment.invoiceNumber} • {payment.member.membershipNumber}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-green-600">
											{formatCurrency(Number(payment.amount))}
										</p>
										<p className="text-xs text-muted-foreground">
											{payment.paymentMode}
										</p>
									</div>
								</div>
							) : (
								<Link key={payment.id} href={`/billing/invoices/${payment.id}`}>
									<div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
										<div className="flex-1">
											<p className="font-medium">{payment.member.name}</p>
											<p className="text-sm text-muted-foreground">
												{payment.invoiceNumber} • {payment.member.membershipNumber}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-green-600">
												{formatCurrency(Number(payment.amount))}
											</p>
											<p className="text-xs text-muted-foreground">
												{payment.paymentMode}
											</p>
										</div>
									</div>
								</Link>
							)
						)}
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			{isSuperAdmin && gymProfileId ? null : (
				<div className="grid gap-4 md:grid-cols-3">
					<Link href="/billing/payments">
						<Card className="hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
							<CardHeader>
								<CardTitle className="text-lg">All Payments</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									View complete payment history and transactions
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link href="/billing/invoices">
						<Card className="hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
							<CardHeader>
								<CardTitle className="text-lg">Invoices</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Manage and download invoices
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link href="/memberships">
						<Card className="hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
							<CardHeader>
								<CardTitle className="text-lg">Membership Plans</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Configure pricing and plans
								</p>
							</CardContent>
						</Card>
					</Link>
				</div>
			)}
		</div>
	);
}
