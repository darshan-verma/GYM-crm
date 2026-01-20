import { notFound } from "next/navigation";
import { getMemberById } from "@/lib/actions/members";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Edit,
	Phone,
	Mail,
	MapPin,
	Calendar,
	User,
	CreditCard,
	Activity,
	Dumbbell,
	UtensilsCrossed,
	AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
	formatDate,
	formatCurrency,
	formatPhoneNumber,
	formatDuration,
} from "@/lib/utils/format";
import MembershipEditButton from "@/components/members/MembershipEditButton";

const statusColors = {
	ACTIVE: "bg-green-100 text-green-800 border-green-200",
	EXPIRED: "bg-red-100 text-red-800 border-red-200",
	SUSPENDED: "bg-orange-100 text-orange-800 border-orange-200",
	PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default async function MemberDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const member = await getMemberById(id);

	if (!member) {
		notFound();
	}

	const activeMembership = member.memberships.find((m) => m.active);
	const recentPayments = member.payments.slice(0, 10);
	const recentAttendance = member.attendance.slice(0, 10);
	// eslint-disable-next-line react-hooks/purity
	const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	// Calculate payment totals and discounts
	// Base due is the membership finalAmount (ex-GST)
	const baseDue = activeMembership ? Number(activeMembership.finalAmount) : 0;
	
	// Calculate total discounts (reduces base due)
	const totalDiscounts = member.payments.reduce(
		(sum, p) => sum + Number(p.discount || 0),
		0
	);
	
	// Calculate total payments excluding GST (reduces base due)
	// GST is tax pass-through, doesn't reduce what member owes
	const totalPaymentsExcludingGST = member.payments.reduce(
		(sum, p) => {
			const paymentAmount = Number(p.amount);
			const gstAmount = Number(p.gstAmount || 0);
			return sum + (paymentAmount - gstAmount);
		},
		0
	);
	
	// Total paid (including GST) - for display only
	const totalPaid = member.payments.reduce(
		(sum, p) => sum + Number(p.amount),
		0
	);
	
	// Remaining base due = Base Due - Discounts - Payments (excluding GST)
	const remainingBalance = baseDue - totalDiscounts - totalPaymentsExcludingGST;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<Avatar className="h-20 w-20">
						<AvatarImage src={member.photo || undefined} />
						<AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl">
							{member.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-3xl font-bold">{member.name}</h1>
						<p className="text-muted-foreground mt-1">
							{member.membershipNumber}
						</p>
						<div className="flex items-center gap-2 mt-2">
							<Badge variant="outline" className={statusColors[member.status]}>
								{member.status}
							</Badge>
							{activeMembership && activeMembership.plan && (
								<Badge variant="outline">{activeMembership.plan.name}</Badge>
							)}
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" asChild>
						<Link href={`/members/${member.id}/edit`}>
							<Edit className="w-4 h-4 mr-2" />
							Edit
						</Link>
					</Button>
					<Button asChild>
						<Link href={`/billing/payments/new?memberId=${member.id}`}>
							<CreditCard className="w-4 h-4 mr-2" />
							Record Payment
						</Link>
					</Button>
				</div>
			</div>

			{/* Expiry Alert */}
			{activeMembership &&
				new Date(activeMembership.endDate) < sevenDaysFromNow && (
					<Card className="border-orange-200 bg-orange-50">
						<CardContent className="flex items-center gap-3 pt-6">
							<AlertCircle className="w-5 h-5 text-orange-600" />
							<div>
								<p className="font-medium text-orange-900">
									Membership Expiring Soon
								</p>
								<p className="text-sm text-orange-700">
									Expires on {formatDate(activeMembership.endDate)}
								</p>
							</div>
							<Button size="sm" variant="outline" className="ml-auto" asChild>
								<Link href={`/memberships/renew/${activeMembership.id}`}>
									Renew Now
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}

			<div className="grid gap-6 md:grid-cols-3">
				{/* Personal Information */}
				<Card className="md:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{member.phone && (
							<div className="flex items-start gap-3">
								<Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">
										{formatPhoneNumber(member.phone)}
									</p>
								</div>
							</div>
						)}
						{member.email && (
							<div className="flex items-start gap-3">
								<Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-medium">{member.email}</p>
								</div>
							</div>
						)}
						{member.dateOfBirth && (
							<div className="flex items-start gap-3">
								<Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-sm text-muted-foreground">Date of Birth</p>
									<p className="font-medium">
										{formatDate(member.dateOfBirth)}
									</p>
								</div>
							</div>
						)}
						{(member.address || member.city) && (
							<div className="flex items-start gap-3">
								<MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-sm text-muted-foreground">Address</p>
									<p className="font-medium">
										{[member.address, member.city, member.state, member.pincode]
											.filter(Boolean)
											.join(", ")}
									</p>
								</div>
							</div>
						)}
						{member.gender && (
							<div>
								<p className="text-sm text-muted-foreground">Gender</p>
								<p className="font-medium">{member.gender}</p>
							</div>
						)}
						{member.bloodGroup && (
							<div>
								<p className="text-sm text-muted-foreground">Blood Group</p>
								<p className="font-medium">{member.bloodGroup}</p>
							</div>
						)}
						{member.medicalConditions && (
							<div>
								<p className="text-sm text-muted-foreground">
									Medical Conditions
								</p>
								<p className="font-medium">{member.medicalConditions}</p>
							</div>
						)}
						<Separator />
						{member.emergencyName && (
							<>
								<div>
									<p className="text-sm text-muted-foreground">
										Emergency Contact
									</p>
									<p className="font-medium">{member.emergencyName}</p>
									{member.emergencyContact && (
										<p className="text-sm mt-1">
											{formatPhoneNumber(member.emergencyContact)}
										</p>
									)}
								</div>
							</>
						)}
						{member.trainer && (
							<div>
								<p className="text-sm text-muted-foreground">
									Assigned Trainer
								</p>
								<p className="font-medium">{member.trainer.name}</p>
							</div>
						)}
						<div>
							<p className="text-sm text-muted-foreground">Member Since</p>
							<p className="font-medium">{formatDate(member.joiningDate)}</p>
						</div>
					</CardContent>
				</Card>

				{/* Main Content */}
				<div className="md:col-span-2 space-y-6">
					{/* Active Membership */}
					{activeMembership && activeMembership.plan && (() => {
						const plan = activeMembership.plan;
						return (
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle>Active Membership</CardTitle>
											<CardDescription>
												Current membership plan details
											</CardDescription>
										</div>
										<MembershipEditButton
											membership={{
												id: activeMembership.id,
												memberId: activeMembership.memberId,
												planId: activeMembership.planId,
												startDate: activeMembership.startDate,
												endDate: activeMembership.endDate,
												amount: Number(activeMembership.amount),
												discount: activeMembership.discount
													? Number(activeMembership.discount)
													: undefined,
												discountType: activeMembership.discountType || undefined,
												finalAmount: Number(activeMembership.finalAmount),
												notes: activeMembership.notes || undefined,
												plan: {
													id: plan.id,
													name: plan.name,
													price: Number(plan.price),
													duration: plan.duration,
												},
											}}
										/>
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										<div>
											<p className="text-sm text-muted-foreground">Plan</p>
											<p className="text-lg font-semibold">
												{plan.name}
											</p>
										</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Amount</p>
										<p className="text-lg font-semibold">
											{formatCurrency(Number(activeMembership.finalAmount))}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Total Paid</p>
										<p className="text-lg font-semibold text-green-600">
											{formatCurrency(totalPaid)}
										</p>
									</div>
									{totalDiscounts > 0 && (
										<div>
											<p className="text-sm text-muted-foreground">Total Discounts</p>
											<p className="text-lg font-semibold text-blue-600">
												{formatCurrency(totalDiscounts)}
											</p>
										</div>
									)}
									<div>
										<p className="text-sm text-muted-foreground">Remaining Balance</p>
										<p className={`text-lg font-semibold ${remainingBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
											{remainingBalance > 0 ? formatCurrency(remainingBalance) : 'No Dues'}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Start Date</p>
										<p className="font-medium">
											{formatDate(activeMembership.startDate)}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">End Date</p>
										<p className="font-medium">
											{formatDate(activeMembership.endDate)}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
						);
					})()}

					{/* Tabs */}
					<Tabs defaultValue="payments" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="payments">
								<CreditCard className="w-4 h-4 mr-2" />
								Payments
							</TabsTrigger>
							<TabsTrigger value="attendance">
								<Activity className="w-4 h-4 mr-2" />
								Attendance
							</TabsTrigger>
							<TabsTrigger value="workouts">
								<Dumbbell className="w-4 h-4 mr-2" />
								Workouts
							</TabsTrigger>
							<TabsTrigger value="diet">
								<UtensilsCrossed className="w-4 h-4 mr-2" />
								Diet Plans
							</TabsTrigger>
						</TabsList>

						{/* Payments Tab */}
						<TabsContent value="payments" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Payment History</CardTitle>
									<CardDescription>
										Total {member.payments.length} payments
									</CardDescription>
								</CardHeader>
								<CardContent>
									{recentPayments.length === 0 ? (
										<p className="text-center text-muted-foreground py-8">
											No payments recorded yet
										</p>
									) : (
										<div className="space-y-3">
											{recentPayments.map((payment) => (
												<div
													key={payment.id}
													className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
												>
													<div>
														<p className="font-medium">
															{payment.invoiceNumber}
														</p>
														<p className="text-sm text-muted-foreground">
															{formatDate(payment.paymentDate)} •{" "}
															{payment.paymentMode}
														</p>
													</div>
													<p className="text-lg font-semibold text-green-600">
														{formatCurrency(Number(payment.amount))}
													</p>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Attendance Tab */}
						<TabsContent value="attendance" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Attendance History</CardTitle>
									<CardDescription>
										Total {member.attendance.length} check-ins
									</CardDescription>
								</CardHeader>
								<CardContent>
									{recentAttendance.length === 0 ? (
										<p className="text-center text-muted-foreground py-8">
											No attendance records yet
										</p>
									) : (
										<div className="space-y-3">
											{recentAttendance.map((record) => (
												<div
													key={record.id}
													className="flex items-center justify-between p-3 border rounded-lg"
												>
													<div>
														<p className="font-medium">
															{formatDate(record.date)}
														</p>
														<p className="text-sm text-muted-foreground">
															Check-in:{" "}
															{new Date(record.checkIn).toLocaleTimeString(
																"en-IN",
																{ hour: "2-digit", minute: "2-digit" }
															)}
															{record.checkOut && (
																<>
																	{" "}
																	• Check-out:{" "}
																	{new Date(record.checkOut).toLocaleTimeString(
																		"en-IN",
																		{ hour: "2-digit", minute: "2-digit" }
																	)}
																</>
															)}
														</p>
													</div>
													{record.duration && (
														<Badge variant="outline">
															{formatDuration(record.duration)}
														</Badge>
													)}
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Workouts Tab */}
						<TabsContent value="workouts" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Workout Plans</CardTitle>
									<CardDescription>Assigned workout programs</CardDescription>
								</CardHeader>
								<CardContent>
									{member.workoutPlans.length === 0 ? (
										<div className="text-center py-8">
											<p className="text-muted-foreground mb-4">
												No workout plans assigned
											</p>
											<Button size="sm" asChild>
												<Link href={`/workouts/new?memberId=${member.id}`}>
													Create Workout Plan
												</Link>
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{member.workoutPlans.map((plan) => (
												<div key={plan.id} className="p-3 border rounded-lg">
													<p className="font-medium">{plan.name}</p>
													<p className="text-sm text-muted-foreground mt-1">
														{plan.description}
													</p>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Diet Tab */}
						<TabsContent value="diet" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>Diet Plans</CardTitle>
									<CardDescription>Assigned nutrition programs</CardDescription>
								</CardHeader>
								<CardContent>
									{member.dietPlans.length === 0 ? (
										<div className="text-center py-8">
											<p className="text-muted-foreground mb-4">
												No diet plans assigned
											</p>
											<Button size="sm" asChild>
												<Link href={`/diets/new?memberId=${member.id}`}>
													Create Diet Plan
												</Link>
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{member.dietPlans.map((plan) => (
												<div key={plan.id} className="p-3 border rounded-lg">
													<p className="font-medium">{plan.name}</p>
													<p className="text-sm text-muted-foreground mt-1">
														{plan.description}
													</p>
													{plan.totalCalories && (
														<p className="text-sm mt-2">
															<span className="font-medium">
																{plan.totalCalories}
															</span>{" "}
															calories/day
														</p>
													)}
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
