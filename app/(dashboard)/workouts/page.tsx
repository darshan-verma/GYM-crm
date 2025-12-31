import { getWorkoutPlans } from "@/lib/actions/workouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Dumbbell, User, Calendar, Target } from "lucide-react";

interface _WorkoutPlanWithMember {
	id: string;
	name: string;
	member: {
		id: string;
		name: string;
		membershipNumber: string;
	};
	exercises: unknown[] | null;
}

export default async function WorkoutPlansPage() {
	const plans = await getWorkoutPlans();

	const getDifficultyColor = (difficulty: string | null) => {
		switch (difficulty) {
			case "BEGINNER":
				return "bg-green-100 text-green-800";
			case "INTERMEDIATE":
				return "bg-yellow-100 text-yellow-800";
			case "ADVANCED":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getGoalColor = (goal: string | null) => {
		switch (goal) {
			case "WEIGHT_LOSS":
				return "bg-blue-100 text-blue-800";
			case "MUSCLE_GAIN":
				return "bg-purple-100 text-purple-800";
			case "ENDURANCE":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Workout Plans</h1>
					<p className="text-gray-600 mt-1">
						Manage and assign workout plans to members
					</p>
				</div>
				<Link href="/workouts/new">
					<Button>
						<Plus className="h-4 w-4 mr-2" />
						Create Workout Plan
					</Button>
				</Link>
			</div>

			{plans.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Dumbbell className="h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-semibold mb-2">No workout plans yet</h3>
						<p className="text-gray-600 mb-6 text-center">
							Create your first workout plan to start training members
						</p>
						<Link href="/workouts/new">
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								Create Workout Plan
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
									{plan.difficulty && (
										<Badge className={getDifficultyColor(plan.difficulty)}>
											{plan.difficulty}
										</Badge>
									)}
									{plan.goal && (
										<Badge className={getGoalColor(plan.goal)}>
											{plan.goal.replace("_", " ")}
										</Badge>
									)}
								</div>

								<div className="space-y-2 text-sm">
									<div className="flex items-center gap-2 text-gray-600">
										<Dumbbell className="h-4 w-4" />
										<span>
											{Array.isArray(plan.exercises)
												? plan.exercises.length
												: 0}{" "}
											exercises
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

								<div className="flex gap-2 pt-4">
									<Link href={`/workouts/${plan.id}`} className="flex-1">
										<Button variant="outline" className="w-full" size="sm">
											View Details
										</Button>
									</Link>
									<Link href={`/workouts/${plan.id}/edit`}>
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

			<Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Target className="h-5 w-5 text-blue-600" />
						Quick Tips
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm text-gray-700">
						<li>
							• Customize workout plans based on member goals and fitness levels
						</li>
						<li>
							• Include rest times and proper form notes for each exercise
						</li>
						<li>• Track progress and adjust plans regularly</li>
						<li>• Set realistic timelines for achieving fitness goals</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
