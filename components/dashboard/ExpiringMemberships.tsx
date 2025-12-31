"use client";

import { useState } from "react";
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
import { AlertCircle, Phone } from "lucide-react";
import Link from "next/link";

interface ExpiringMember {
	id: string;
	name: string;
	photo?: string;
	phone: string;
	membershipNumber: string;
	expiryDate: Date;
	planName: string;
}

interface ExpiringMembershipsProps {
	memberships?: ExpiringMember[];
}

const defaultMemberships: ExpiringMember[] = [
	{
		id: "1",
		name: "Robert Brown",
		phone: "9876543210",
		membershipNumber: "PBF1001",
		expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
		planName: "3 Month Plan",
	},
	{
		id: "2",
		name: "Lisa Anderson",
		phone: "9876543211",
		membershipNumber: "PBF1002",
		expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
		planName: "6 Month Plan",
	},
	{
		id: "3",
		name: "Tom Wilson",
		phone: "9876543212",
		membershipNumber: "PBF1003",
		expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
		planName: "1 Month Plan",
	},
];

export default function ExpiringMemberships({
	memberships = defaultMemberships,
}: ExpiringMembershipsProps) {
	const [now] = useState(() => Date.now());

	const getDaysRemaining = (date: Date) => {
		const days = Math.ceil((date.getTime() - now) / (1000 * 60 * 60 * 24));
		return days;
	};

	return (
		<Card className="border-orange-200">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertCircle className="w-5 h-5 text-orange-600" />
					Expiring Memberships
				</CardTitle>
				<CardDescription>
					Members whose memberships expire within 7 days
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{memberships.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No memberships expiring soon
						</p>
					) : (
						memberships.map((member) => {
							const daysRemaining = getDaysRemaining(member.expiryDate);
							const isUrgent = daysRemaining <= 3;

							return (
								<div
									key={member.id}
									className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
								>
									<Avatar className="h-10 w-10">
										<AvatarImage src={member.photo} />
										<AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
											{member.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>

									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">
											{member.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{member.membershipNumber} • {member.planName}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<Badge
												variant="outline"
												className={
													isUrgent
														? "bg-red-50 text-red-700 border-red-200"
														: "bg-orange-50 text-orange-700 border-orange-200"
												}
											>
												{daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
											</Badge>
										</div>
									</div>

									<div className="flex flex-col gap-1">
										<Button size="sm" variant="outline" asChild>
											<Link href={`tel:${member.phone}`}>
												<Phone className="w-3 h-3" />
											</Link>
										</Button>
										<Button size="sm" variant="default" asChild>
											<Link href={`/members/${member.id}`}>View</Link>
										</Button>
									</div>
								</div>
							);
						})
					)}
				</div>

				{memberships.length > 0 && (
					<Button variant="outline" className="w-full mt-4" asChild>
						<Link href="/members?status=ACTIVE">View All Members</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
