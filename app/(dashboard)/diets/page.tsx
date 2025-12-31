import { getDietPlans } from "@/lib/actions/diets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
	Plus,
	UtensilsCrossed,
	User,
	Calendar,
	Target,
	Flame,
} from "lucide-react";

interface _DietPlanWithMember {
	id: string;
	name: string;
	member: {
		id: string;
		name: string;
		membershipNumber: string;
	};
	meals: unknown[] | null;
}

export default async function DietsPage() {
	const plans = await getDietPlans();

	const getDietTypeColor = (type: string | null) => {
		switch (type) {
			case "WEIGHT_LOSS":
				return "bg-blue-100 text-blue-800";
			case "MUSCLE_GAIN":
				return "bg-purple-100 text-purple-800";
			case "MAINTENANCE":
				return "bg-green-100 text-green-800";
			case "KETO":
				return "bg-orange-100 text-orange-800";
			case "VEGETARIAN":
				return "bg-emerald-100 text-emerald-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Diet Plans</h1>
					<p className="text-gray-600 mt-1">
						Manage and assign nutrition plans to members
					</p>
				</div>
				<Link href="/diets/new">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create Diet Plan
					</Button>
				</Link>
			</div>

			{plans.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<UtensilsCrossed className="h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-semibold mb-2">No diet plans yet</h3>
						<p className="text-gray-600 mb-6 text-center">
							Create your first diet plan to start nutrition coaching
						</p>
						<Link href="/diets/new">
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Create Diet Plan
							</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{plans.map((plan) => (
						<Card key={plan.id} className="hover:shadow-lg transition-shadow">
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
										<div className="flex items-center gap-2 text-sm text-gray-600">
											<User className="h-4 w-4" />
											<Link
												href={`/members/${plan.member.id}`}
												className="hover:text-blue-600 hover:underline"
											>
												{plan.member.name}
											</Link>
										</div>
									</div>
									{!plan.active && (
										<Badge variant="outline" className="bg-gray-100">
											Inactive
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{plan.description && (
									<p className="text-sm text-gray-600 line-clamp-2">
										{plan.description}
									</p>
								)}

								<div className="flex flex-wrap gap-2">
									{plan.goal && (
										<Badge className={getDietTypeColor(plan.goal)}>
											{plan.goal.replace("_", " ")}
										</Badge>
									)}
								</div>

								<div className="space-y-2 text-sm">
									{plan.totalCalories && (
										<div className="flex items-center gap-2 text-gray-600">
											<Flame className="h-4 w-4" />
											<span>{plan.totalCalories} kcal/day</span>
										</div>
									)}
									<div className="flex items-center gap-2 text-gray-600">
										<UtensilsCrossed className="h-4 w-4" />
										<span>
											{Array.isArray(plan.meals) ? plan.meals.length : 0}{" "}
											meals/day
										</span>
									</div>
									<div className="flex items-center gap-2 text-gray-600">
										<Calendar className="h-4 w-4" />
										<span>
											{new Date(plan.startDate).toLocaleDateString()}
											{plan.endDate &&
												` - ${new Date(plan.endDate).toLocaleDateString()}`}
										</span>
									</div>
								</div>

								{plan.totalProtein && (
									<div className="pt-2">
										<div className="text-center p-2 bg-purple-50 rounded">
											<div className="font-semibold text-purple-700">
												{plan.totalProtein}g
											</div>
											<div className="text-gray-600 text-xs">Protein/day</div>
										</div>
									</div>
								)}

								<div className="flex gap-2 pt-4">
									<Link href={`/diets/${plan.id}`} className="flex-1">
										<Button variant="outline" className="w-full" size="sm">
											View Details
										</Button>
									</Link>
									<Link href={`/diets/${plan.id}/edit`}>
										<Button variant="ghost" size="sm">
											Edit
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5 text-green-600" />
						Nutrition Tips
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm text-gray-700">
						<li>
							• Customize diet plans based on member goals and dietary
							preferences
						</li>
						<li>
							• Track macros (protein, carbs, fats) for balanced nutrition
						</li>
						<li>• Adjust calorie targets based on activity levels</li>
						<li>• Include variety to ensure adequate micronutrient intake</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
