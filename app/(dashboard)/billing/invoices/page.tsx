import { getPayments } from "@/lib/actions/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Download, Eye, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export default async function InvoicesPage() {
	const paymentsData = await getPayments({ limit: 100 });

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Invoices</h1>
					<p className="text-gray-600 mt-1">
						View and download payment invoices
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/api/export/payments">
						<Download className="h-4 w-4 mr-2" />
						Export All
					</Link>
				</Button>
			</div>

			{paymentsData.payments.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<FileText className="h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
						<p className="text-gray-600 mb-6">
							Invoices will appear here when payments are recorded
						</p>
						<Link href="/billing/payments/new">
							<Button>Record First Payment</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>All Invoices ({paymentsData.total})</CardTitle>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									<Search className="h-4 w-4 mr-2" />
									Search
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b">
									<tr>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
											Invoice
										</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
											Member
										</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
											Date
										</th>
										<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
											Payment Mode
										</th>
										<th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
											Amount
										</th>
										<th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{paymentsData.payments.map((payment) => (
										<tr key={payment.id} className="hover:bg-gray-50">
											<td className="py-4 px-4">
												<Link
													href={`/billing/invoices/${payment.id}`}
													className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
												>
													{payment.invoiceNumber}
												</Link>
											</td>
											<td className="py-4 px-4">
												<div>
													<Link
														href={`/members/${payment.member.id}`}
														className="font-medium hover:text-blue-600"
													>
														{payment.member.name}
													</Link>
													<p className="text-sm text-gray-500">
														{payment.member.membershipNumber}
													</p>
												</div>
											</td>
											<td className="py-4 px-4 text-sm text-gray-600">
												{new Date(payment.paymentDate).toLocaleDateString()}
											</td>
											<td className="py-4 px-4">
												<Badge variant="outline">{payment.paymentMode}</Badge>
											</td>
											<td className="py-4 px-4 text-right font-semibold text-green-600">
												{formatCurrency(Number(payment.amount))}
											</td>
											<td className="py-4 px-4 text-right">
												<div className="flex gap-2 justify-end">
													<Link href={`/billing/invoices/${payment.id}`}>
														<Button variant="ghost" size="sm">
															<Eye className="h-4 w-4" />
														</Button>
													</Link>
													<Link
														href={`/api/invoices/${payment.id}/download`}
														target="_blank"
													>
														<Button variant="ghost" size="sm">
															<Download className="h-4 w-4" />
														</Button>
													</Link>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
