"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MembershipChartProps {
	data?: Array<{
		name: string;
		value: number;
	}>;
}

const defaultData = [
	{ name: "Active", value: 245 },
	{ name: "Expired", value: 38 },
	{ name: "Suspended", value: 12 },
	{ name: "Pending", value: 25 },
];

const COLORS = {
	Active: "hsl(142 71% 45%)",
	Expired: "hsl(0 84% 60%)",
	Suspended: "hsl(25 95% 53%)",
	Pending: "hsl(45 93% 47%)",
};

export default function MembershipChart({
	data = defaultData,
}: MembershipChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Membership Status</CardTitle>
				<CardDescription>Distribution of member statuses</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ name, percent }) =>
								`${name} ${((percent || 0) * 100).toFixed(0)}%`
							}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[entry.name as keyof typeof COLORS]}
								/>
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--background))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "6px",
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
