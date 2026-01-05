import { getPayment } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
	ArrowLeft,
	Mail,
	Phone,
	MapPin,
	Calendar,
	CreditCard,
} from "lucide-react";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils/format";
import { InvoiceActions } from "@/components/invoices/InvoiceActions";

interface PaymentWithMember {
	id: string;
	invoiceNumber: string;
	memberId: string;
	amount: number;
	paymentMode: string;
	paymentDate: Date;
	transactionId: string | null;
	referenceNumber: string | null;
	notes: string | null;
	receiptPath: string | null;
	createdBy: string | null;
	createdAt: Date;
	member: {
		id: string;
		name: string;
		membershipNumber: string;
		email: string | null;
		phone: string | null;
		memberships: {
			id: string;
			startDate: Date;
			endDate: Date;
			plan: {
				id: string;
				name: string;
				description: string | null;
				duration: number;
				price: number;
			};
		}[];
	};
}

export default async function InvoiceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const payment = (await getPayment(id)) as unknown as PaymentWithMember;

	if (!payment) {
		notFound();
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-start print:hidden">
				<div>
					<Link
						href="/billing/invoices"
						className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Invoices
					</Link>
					<h1 className="text-3xl font-bold">
						Invoice {payment.invoiceNumber}
					</h1>
					<p className="text-gray-600 mt-1">
						Payment received on{" "}
						{new Date(payment.paymentDate).toLocaleDateString()}
					</p>
				</div>
				<InvoiceActions invoiceId={payment.id} />
			</div>

			{/* Invoice Document */}
			<div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
				{/* Header */}
				<div className="flex justify-between items-start mb-8 pb-8 border-b">
					<div>
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Pro Bodyline
						</h2>
						<div className="text-sm text-gray-600 space-y-1">
							<p>Fitness & Wellness Center</p>
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								123 Fitness Street, Gym City, GC 12345
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4" />
								+1 (555) 123-4567
							</div>
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4" />
								contact@probodyline.com
							</div>
						</div>
					</div>
					<div className="text-right">
						<div className="text-sm text-gray-600 mb-1">INVOICE</div>
						<div className="text-2xl font-bold text-gray-900">
							{payment.invoiceNumber}
						</div>
						<div className="text-sm text-gray-600 mt-2">
							Date: {new Date(payment.paymentDate).toLocaleDateString()}
						</div>
					</div>
				</div>

				{/* Member Details */}
				<div className="grid grid-cols-2 gap-8 mb-8">
					<div>
						<h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
							Bill To
						</h3>
						<div className="text-gray-900">
							<p className="font-semibold text-lg mb-2">
								{payment.member.name}
							</p>
							<div className="text-sm space-y-1 text-gray-600">
								<p>Member ID: {payment.member.membershipNumber}</p>
								{payment.member.email && (
									<div className="flex items-center gap-2">
										<Mail className="h-3 w-3" />
										{payment.member.email}
									</div>
								)}
								{payment.member.phone && (
									<div className="flex items-center gap-2">
										<Phone className="h-3 w-3" />
										{payment.member.phone}
									</div>
								)}
							</div>
						</div>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
							Payment Details
						</h3>
						<div className="text-sm space-y-2">
							<div className="flex justify-between">
								<span className="text-gray-600">Payment Date:</span>
								<span className="font-medium">
									{new Date(payment.paymentDate).toLocaleDateString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Payment Method:</span>
								<span className="font-medium">{payment.paymentMode}</span>
							</div>
							{payment.transactionId && (
								<div className="flex justify-between">
									<span className="text-gray-600">Transaction ID:</span>
									<span className="font-medium">{payment.transactionId}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Membership Plan Details */}
				{payment.member.memberships?.[0] && (
					<div className="mb-8">
						<h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
							Membership Plan
						</h3>
						<Card>
							<CardContent className="pt-6">
								<div className="flex justify-between items-start">
									<div>
										{(() => {
											const membership = payment.member.memberships[0];
											return (
												<>
													<p className="font-semibold text-lg">
														{membership.plan.name}
													</p>
													{membership.plan.description && (
														<p className="text-sm text-gray-600 mt-1">
															{membership.plan.description}
														</p>
													)}
													<div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
														<div className="flex items-center gap-1">
															<Calendar className="h-4 w-4" />
															{membership.plan.duration} days
														</div>
														<div>
															Start:{" "}
															{new Date(
																membership.startDate
															).toLocaleDateString()}
														</div>
														<div>
															End:{" "}
															{new Date(
																membership.endDate
															).toLocaleDateString()}
														</div>
													</div>
												</>
											);
										})()}
									</div>
									<div className="text-right">
										{(() => {
											const membership = payment.member.memberships[0];
											return (
												<>
													<p className="text-sm text-gray-600">Plan Price</p>
													<p className="text-xl font-bold">
														{formatCurrency(Number(membership.plan.price))}
													</p>
												</>
											);
										})()}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Payment Breakdown */}
				<div className="mb-8">
					<table className="w-full">
						<thead className="bg-gray-50 border-b">
							<tr>
								<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
									Description
								</th>
								<th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
									Amount
								</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							<tr>
								<td className="py-4 px-4">
									<div>
										<p className="font-medium">Membership Payment</p>
										{payment.notes && (
											<p className="text-sm text-gray-600 mt-1">
												{payment.notes}
											</p>
										)}
									</div>
								</td>
								<td className="py-4 px-4 text-right font-medium">
									{formatCurrency(Number(payment.amount))}
								</td>
							</tr>
						</tbody>
						<tfoot className="border-t-2 border-gray-900">
							<tr>
								<td className="py-4 px-4 text-right font-semibold text-lg">
									Total Paid:
								</td>
								<td className="py-4 px-4 text-right font-bold text-2xl text-green-600">
									{formatCurrency(Number(payment.amount))}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>

				{/* Footer */}
				<div className="pt-8 border-t text-center text-sm text-gray-600">
					<p className="mb-2">Thank you for your payment!</p>
					<p>
						For questions about this invoice, please contact us at
						contact@probodyline.com
					</p>
				</div>
			</div>

			{/* Additional Actions - Print Hidden */}
			<Card className="print:hidden">
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-3">
						<Link href={`/members/${payment.member.id}`}>
							<Button variant="outline">View Member Profile</Button>
						</Link>
						<Link href="/billing/payments/new">
							<Button variant="outline">
								<CreditCard className="h-4 w-4 mr-2" />
								Record New Payment
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
