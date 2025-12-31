"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
	data?: Array<{
		name: string;
		revenue: number;
	}>;
}

const defaultData = [
	{ name: "Jan", revenue: 45000 },
	{ name: "Feb", revenue: 52000 },
	{ name: "Mar", revenue: 48000 },
	{ name: "Apr", revenue: 61000 },
	{ name: "May", revenue: 55000 },
	{ name: "Jun", revenue: 67000 },
];

export default function RevenueChart({
	data = defaultData,
}: RevenueChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenue Overview</CardTitle>
				<CardDescription>Monthly revenue for the past 6 months</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis
							dataKey="name"
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							className="text-xs"
							tick={{ fill: "hsl(var(--muted-foreground))" }}
							tickFormatter={(value) => `₹${value / 1000}k`}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--background))",
								border: "1px solid hsl(var(--border))",
								borderRadius: "6px",
							}}
							formatter={(value: number) => [
								`₹${value.toLocaleString()}`,
								"Revenue",
							]}
						/>
						<Bar
							dataKey="revenue"
							fill="hsl(217 91% 60%)"
							radius={[8, 8, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
