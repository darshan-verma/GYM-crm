"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, CreditCard, Calendar, UserCheck } from "lucide-react";

interface Activity {
	id: string;
	type: "member" | "payment" | "attendance" | "trainer";
	title: string;
	description: string;
	timestamp: Date;
	user?: {
		name: string;
		avatar?: string;
	};
	amount?: number;
}

interface RecentActivityProps {
	activities?: Activity[];
}

const defaultActivities: Activity[] = [
	{
		id: "1",
		type: "member",
		title: "New Member Added",
		description: "John Doe joined the gym",
		timestamp: new Date(Date.now() - 1000 * 60 * 15),
		user: { name: "John Doe" },
	},
	{
		id: "2",
		type: "payment",
		title: "Payment Received",
		description: "Sarah Smith paid ₹5,000",
		timestamp: new Date(Date.now() - 1000 * 60 * 45),
		amount: 5000,
	},
	{
		id: "3",
		type: "attendance",
		title: "Member Check-in",
		description: "Mike Johnson checked in",
		timestamp: new Date(Date.now() - 1000 * 60 * 120),
		user: { name: "Mike Johnson" },
	},
	{
		id: "4",
		type: "payment",
		title: "Payment Received",
		description: "Emma Wilson paid ₹3,500",
		timestamp: new Date(Date.now() - 1000 * 60 * 180),
		amount: 3500,
	},
];

const activityIcons = {
	member: { icon: UserPlus, color: "bg-blue-500/10 text-blue-700" },
	payment: { icon: CreditCard, color: "bg-green-500/10 text-green-700" },
	attendance: { icon: Calendar, color: "bg-indigo-500/10 text-indigo-700" },
	trainer: { icon: UserCheck, color: "bg-orange-500/10 text-orange-700" },
};

export default function RecentActivity({
	activities = defaultActivities,
}: RecentActivityProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
				<CardDescription>Latest updates from your gym</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity) => {
						const { icon: Icon, color } = activityIcons[activity.type];

						return (
							<div key={activity.id} className="flex items-start gap-4">
								<div className={`p-2 rounded-lg ${color}`}>
									<Icon className="w-4 h-4" />
								</div>
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium leading-none">
										{activity.title}
									</p>
									<p className="text-sm text-muted-foreground">
										{activity.description}
									</p>
									<p className="text-xs text-muted-foreground">
										{formatDistanceToNow(activity.timestamp, {
											addSuffix: true,
										})}
									</p>
								</div>
								{activity.amount && (
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700 border-green-200"
									>
										₹{activity.amount.toLocaleString()}
									</Badge>
								)}
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
