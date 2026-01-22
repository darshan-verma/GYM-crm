"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDietPlan, deleteDietPlan } from "@/lib/actions/diets";
import { foodDatabase } from "@/lib/data/food-database";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Member {
	id: string;
	name: string;
	email: string | null;
}

interface FoodItem {
	foodName: string;
	portion: number;
	unit: string;
}

interface Meal {
	mealTime: string;
	items: FoodItem[];
	calories: number;
	protein: number;
	carbs: number;
	fats: number;
	notes: string;
}

interface Day {
	day: string;
	meals: Meal[];
}

interface DietPlan {
	id: string;
	name: string;
	description: string | null;
	memberId: string;
	goal: string | null;
	totalCalories: number | null;
	totalProtein: number | null;
	startDate: Date;
	endDate: Date | null;
	meals: Meal[];
	active: boolean;
}

export default function DietEditForm({
	plan,
	members,
}: {
	plan: DietPlan;
	members: Member[];
}) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

	const [formData, setFormData] = useState({
		memberId: plan.memberId,
		name: plan.name,
		description: plan.description || "",
		goal: plan.goal || "",
		totalCalories: plan.totalCalories || 0,
		totalProtein: plan.totalProtein || 0,
		startDate: new Date(plan.startDate).toISOString().split("T")[0],
		endDate: plan.endDate
			? new Date(plan.endDate).toISOString().split("T")[0]
			: "",
		active: plan.active,
	});

	// Check if it's day-wise format or old format
	const isDayWise = Array.isArray(plan.meals) && plan.meals.length > 0 && 'day' in plan.meals[0];
	
	const [days, setDays] = useState<Day[]>(
		isDayWise
			? (plan.meals as unknown as Day[])
			: Array.isArray(plan.meals) && plan.meals.length > 0
			? [
					{
						day: "Day 1",
						meals: (plan.meals as unknown as Meal[]).map((meal: Meal) => meal),
					},
			  ]
			: [
					{
						day: "Day 1",
						meals: [
							{
								mealTime: "Breakfast",
								items: [],
								calories: 0,
								protein: 0,
								carbs: 0,
								fats: 0,
								notes: "",
							},
						],
					},
			  ]
	);

	const categories = [
		"ALL",
		"PROTEIN",
		"CARBS",
		"VEGETABLES",
		"FRUITS",
		"FATS",
		"SNACKS",
	];

	const filteredFoods =
		selectedCategory === "ALL"
			? foodDatabase
			: foodDatabase.filter((food) => food.category === selectedCategory);

	const addDay = () => {
		const dayNumber = days.length + 1;
		setDays([
			...days,
			{
				day: `Day ${dayNumber}`,
				meals: [
					{
						mealTime: "Breakfast",
						items: [],
						calories: 0,
						protein: 0,
						carbs: 0,
						fats: 0,
						notes: "",
					},
				],
			},
		]);
	};

	const removeDay = (dayIndex: number) => {
		if (days.length === 1) {
			toast.error("At least one day is required");
			return;
		}
		setDays(days.filter((_, i) => i !== dayIndex));
	};

	const updateDayName = (dayIndex: number, dayName: string) => {
		const updated = [...days];
		updated[dayIndex] = { ...updated[dayIndex], day: dayName };
		setDays(updated);
	};

	const duplicateDay = (sourceDayIndex: number, targetDayIndex: number) => {
		if (sourceDayIndex === targetDayIndex) {
			toast.error("Cannot duplicate to the same day");
			return;
		}
		const updated = [...days];
		// Deep clone the meals from source day
		const sourceMeals = updated[sourceDayIndex].meals.map((meal) => ({
			...meal,
			items: meal.items.map((item) => ({ ...item })),
		}));
		updated[targetDayIndex].meals = sourceMeals;
		setDays(updated);
		toast.success(`Meals copied from ${updated[sourceDayIndex].day} to ${updated[targetDayIndex].day}`);
	};

	const addMealToDay = (dayIndex: number) => {
		const updated = [...days];
		updated[dayIndex].meals.push({
			mealTime: "",
			items: [],
			calories: 0,
			protein: 0,
			carbs: 0,
			fats: 0,
			notes: "",
		});
		setDays(updated);
	};

	const removeMealFromDay = (dayIndex: number, mealIndex: number) => {
		const updated = [...days];
		if (updated[dayIndex].meals.length === 1) {
			toast.error("At least one meal is required per day");
			return;
		}
		updated[dayIndex].meals = updated[dayIndex].meals.filter(
			(_, i) => i !== mealIndex
		);
		setDays(updated);
	};

	const updateMeal = (
		dayIndex: number,
		mealIndex: number,
		field: keyof Meal,
		value: string | number | FoodItem[]
	) => {
		const updated = [...days];
		updated[dayIndex].meals[mealIndex] = {
			...updated[dayIndex].meals[mealIndex],
			[field]: value,
		};
		setDays(updated);
	};

	const addFoodToMeal = (dayIndex: number, mealIndex: number, foodName: string) => {
		const updated = [...days];
		updated[dayIndex].meals[mealIndex].items.push({
			foodName,
			portion: 1,
			unit: "serving",
		});
		setDays(updated);
	};

	const removeFoodFromMeal = (
		dayIndex: number,
		mealIndex: number,
		foodIndex: number
	) => {
		const updated = [...days];
		updated[dayIndex].meals[mealIndex].items = updated[dayIndex].meals[
			mealIndex
		].items.filter((_, i) => i !== foodIndex);
		setDays(updated);
	};

	const updateFood = (
		dayIndex: number,
		mealIndex: number,
		foodIndex: number,
		field: keyof FoodItem,
		value: string | number
	) => {
		const updated = [...days];
		updated[dayIndex].meals[mealIndex].items[foodIndex] = {
			...updated[dayIndex].meals[mealIndex].items[foodIndex],
			[field]: value,
		};
		setDays(updated);
	};

	const calculateMacros = () => {
		let totalCalories = 0;
		let totalProtein = 0;
		let totalCarbs = 0;
		let totalFat = 0;

		days.forEach((day) => {
			day.meals.forEach((meal) => {
				meal.items.forEach((foodItem) => {
					const food = foodDatabase.find((f) => f.name === foodItem.foodName);
					if (food) {
						let multiplier = foodItem.portion || 1;

						// Handle unit conversions like in the create form
						switch (foodItem.unit) {
							case "serving":
								multiplier = foodItem.portion || 1;
								break;
							case "grams":
								multiplier = (foodItem.portion || 100) / 100;
								break;
							case "cup":
								multiplier = (foodItem.portion || 1) * 2;
								break;
							case "piece":
								multiplier = foodItem.portion || 1;
								break;
							default:
								multiplier = foodItem.portion || 1;
						}

						totalCalories += food.calories * multiplier;
						totalProtein += food.protein * multiplier;
						totalCarbs += food.carbs * multiplier;
						totalFat += food.fat * multiplier;
					}
				});
			});
		});

		return {
			calories: Math.round(totalCalories),
			protein: Math.round(totalProtein),
			carbs: Math.round(totalCarbs),
			fat: Math.round(totalFat),
		};
	};

	const macros = calculateMacros();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (!formData.name.trim()) {
				toast.error("Please enter a diet plan name");
				return;
			}

			// Validate that at least one day has meals with foods
			const hasValidMeals = days.some((day) =>
				day.meals.some((meal) => meal.items.length > 0)
			);
			if (!hasValidMeals) {
				toast.error("Please add at least one meal with foods");
				setLoading(false);
				return;
			}

			// Transform days structure to meals array
			// Format: [{day: "Day 1", meals: [...]}, {day: "Day 2", meals: [...]}]
			const mealsData = days as unknown as Parameters<typeof updateDietPlan>[1]['meals'];

			const result = await updateDietPlan(plan.id, {
				...formData,
				startDate: formData.startDate
					? new Date(formData.startDate)
					: undefined,
				endDate: formData.endDate ? new Date(formData.endDate) : undefined,
				meals: mealsData,
			});

			if (result.success) {
				toast.success("Diet plan updated successfully");
				router.push(`/diets/${plan.id}`);
				router.refresh();
			} else {
				toast.error(result.error || "Failed to update diet plan");
			}
		} catch (error) {
			console.error("Error updating diet plan:", error);
			toast.error("An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setLoading(true);
		try {
			const result = await deleteDietPlan(plan.id);
			if (result.success) {
				toast.success("Diet plan deleted successfully");
				router.push("/diets");
				router.refresh();
			} else {
				toast.error(result.error || "Failed to delete diet plan");
			}
		} catch (_error) {
			toast.error("An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Basic Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="memberId">Member *</Label>
						<Select
							value={formData.memberId}
							onValueChange={(value) =>
								setFormData({ ...formData, memberId: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select member" />
							</SelectTrigger>
							<SelectContent>
								{members.map((member) => (
									<SelectItem key={member.id} value={member.id}>
										{member.name} ({member.email})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Diet Plan Name *</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							placeholder="e.g., High Protein Weight Loss Plan"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							placeholder="Describe the diet plan goals and approach..."
							rows={3}
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="goal">Goal</Label>
							<Select
								value={formData.goal}
								onValueChange={(value) =>
									setFormData({ ...formData, goal: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select goal" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="WEIGHT_LOSS">Weight Loss</SelectItem>
									<SelectItem value="MUSCLE_GAIN">Muscle Gain</SelectItem>
									<SelectItem value="MAINTENANCE">Maintenance</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="totalCalories">Daily Calorie Target</Label>
							<Input
								id="totalCalories"
								type="number"
								value={formData.totalCalories || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										totalCalories: parseInt(e.target.value) || 0,
									})
								}
								placeholder="e.g., 2000"
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="totalProtein">Protein Target (g)</Label>
							<Input
								id="totalProtein"
								type="number"
								value={formData.totalProtein || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										totalProtein: parseInt(e.target.value) || 0,
									})
								}
								placeholder="e.g., 150"
							/>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date *</Label>
							<Input
								id="startDate"
								type="date"
								value={formData.startDate}
								onChange={(e) =>
									setFormData({ ...formData, startDate: e.target.value })
								}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="endDate">End Date</Label>
							<Input
								id="endDate"
								type="date"
								value={formData.endDate}
								onChange={(e) =>
									setFormData({ ...formData, endDate: e.target.value })
								}
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="active"
							checked={formData.active}
							onChange={(e) =>
								setFormData({ ...formData, active: e.target.checked })
							}
							className="rounded border-gray-300"
						/>
						<Label htmlFor="active">Active Plan</Label>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Diet Plan (Day-wise)</CardTitle>
						<Button type="button" onClick={addDay} size="sm" variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Add Day
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{days.map((day, dayIndex) => (
						<div key={dayIndex} className="p-4 border-2 rounded-lg bg-gray-50">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<Input
										type="text"
										value={day.day}
										onChange={(e) => updateDayName(dayIndex, e.target.value)}
										className="font-semibold text-lg w-32"
									/>
								</div>
								<div className="flex gap-2">
									{days.length > 1 && (
										<Select
											onValueChange={(targetIndex) => {
												const targetDayIndex = parseInt(targetIndex);
												duplicateDay(dayIndex, targetDayIndex);
											}}
										>
											<SelectTrigger className="w-auto h-8">
												<SelectValue placeholder="Copy to..." />
											</SelectTrigger>
											<SelectContent>
												{days.map((targetDay, targetIndex) => {
													if (targetIndex === dayIndex) return null;
													return (
														<SelectItem key={targetIndex} value={targetIndex.toString()}>
															Copy to {targetDay.day}
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
									)}
									<Button
										type="button"
										onClick={() => addMealToDay(dayIndex)}
										variant="outline"
										size="sm"
									>
										<Plus className="h-4 w-4 mr-2" />
										Add Meal
									</Button>
									{days.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => removeDay(dayIndex)}
										>
											<Trash2 className="h-4 w-4 text-red-500" />
										</Button>
									)}
								</div>
							</div>

							<div className="space-y-4">
								{day.meals.map((meal, mealIndex) => (
									<div key={mealIndex} className="border rounded-lg p-4 bg-white space-y-4">
										<div className="flex items-start justify-between">
											<div className="flex-1 space-y-4">
												<div className="flex gap-4 items-end">
													<div className="flex-1 space-y-2">
														<Label>Meal Name</Label>
														<Input
															value={meal.mealTime}
															onChange={(e) =>
																updateMeal(dayIndex, mealIndex, "mealTime", e.target.value)
															}
															placeholder="e.g., Breakfast, Lunch, Snack"
														/>
													</div>
													{day.meals.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => removeMealFromDay(dayIndex, mealIndex)}
														>
															<Trash2 className="h-4 w-4 text-red-600" />
														</Button>
													)}
												</div>

												<div className="space-y-3">
													{meal.items.map((food, foodIndex) => {
														const foodItem = foodDatabase.find(
															(f) => f.name === food.foodName
														);
														return (
															<div
																key={foodIndex}
																className="flex gap-2 items-end bg-gray-50 p-3 rounded"
															>
																<div className="flex-1">
																	<Label className="text-xs">Food</Label>
																	<div className="text-sm font-medium">
																		{food.foodName}
																	</div>
																	{foodItem && (
																		<div className="text-xs text-gray-600">
																			{foodItem.calories} cal | P: {foodItem.protein}g
																			| C: {foodItem.carbs}g | F: {foodItem.fat}g
																		</div>
																	)}
																</div>
																<div className="w-24">
																	<Label className="text-xs">Portion</Label>
																	<Input
																		type="number"
																		value={food.portion}
																		onChange={(e) =>
																			updateFood(
																				dayIndex,
																				mealIndex,
																				foodIndex,
																				"portion",
																				parseFloat(e.target.value) || 1
																			)
																		}
																		step="0.5"
																		min="0.5"
																	/>
																</div>
																<div className="w-28">
																	<Label className="text-xs">Unit</Label>
																	<Select
																		value={food.unit}
																		onValueChange={(value) =>
																			updateFood(dayIndex, mealIndex, foodIndex, "unit", value)
																		}
																	>
																		<SelectTrigger>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			<SelectItem value="serving">serving</SelectItem>
																			<SelectItem value="grams">grams</SelectItem>
																			<SelectItem value="cup">cup</SelectItem>
																			<SelectItem value="piece">piece</SelectItem>
																		</SelectContent>
																	</Select>
																</div>
																<Button
																	type="button"
																	variant="ghost"
																	size="icon"
																	onClick={() =>
																		removeFoodFromMeal(dayIndex, mealIndex, foodIndex)
																	}
																>
																	<Trash2 className="h-4 w-4 text-red-600" />
																</Button>
															</div>
														);
													})}
												</div>

												<div className="border-t pt-3">
													<Label className="mb-2 block">Add Food to Meal</Label>
													<div className="flex gap-2 mb-3 flex-wrap">
														{categories.map((cat) => (
															<Button
																key={cat}
																type="button"
																size="sm"
																variant={
																	selectedCategory === cat ? "default" : "outline"
																}
																onClick={() => setSelectedCategory(cat)}
															>
																{cat}
															</Button>
														))}
													</div>
													<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
														{filteredFoods.map((food) => (
															<Button
																key={food.name}
																type="button"
																variant="outline"
																size="sm"
																className="justify-start text-left h-auto py-2"
																onClick={() => addFoodToMeal(dayIndex, mealIndex, food.name)}
															>
																<div>
																	<div className="font-medium text-sm">
																		{food.name}
																	</div>
																	<div className="text-xs text-gray-600">
																		{food.calories} cal
																	</div>
																</div>
															</Button>
														))}
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card className="bg-blue-50 border-blue-200">
				<CardHeader>
					<CardTitle className="text-blue-900">Calculated Macros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-900">
								{macros.calories}
							</div>
							<div className="text-sm text-blue-700">Calories</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-900">
								{macros.protein}g
							</div>
							<div className="text-sm text-purple-700">Protein</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-900">
								{macros.carbs}g
							</div>
							<div className="text-sm text-orange-700">Carbs</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-yellow-900">
								{macros.fat}g
							</div>
							<div className="text-sm text-yellow-700">Fat</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex gap-4">
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button type="button" variant="destructive" disabled={loading}>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete Plan
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete this diet plan. This action cannot
								be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={handleDelete} className="bg-red-600">
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={loading} className="ml-auto">
					{loading ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
