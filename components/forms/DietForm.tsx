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
import { createDietPlan } from "@/lib/actions/diets";
import {
	createDietType,
	getDietTypes,
	seedDefaultDietTypes,
} from "@/lib/actions/diet-types";
import {
	createFood,
	getFoods,
	getFoodCategories,
	seedDefaultFoods,
} from "@/lib/actions/foods";
import { foodDatabase } from "@/lib/data/food-database";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

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
	mealName: string;
	foods: FoodItem[];
}

interface DietFormProps {
	members: Member[];
	dietTypes: Array<{
		id: string;
		name: string;
		description?: string;
		isDefault: boolean;
	}>;
	foods: Array<{
		id: string;
		name: string;
		calories: number;
		protein: number;
		carbs: number;
		fat: number;
		category: string;
		isDefault: boolean;
	}>;
	foodCategories: string[];
}

export default function DietForm({
	members,
	dietTypes: initialDietTypes,
	foods: initialFoods,
	foodCategories: initialCategories,
}: DietFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
	const [dietTypes, setDietTypes] = useState(initialDietTypes);
	const [showAddType, setShowAddType] = useState(false);
	const [newTypeName, setNewTypeName] = useState("");
	const [foods, setFoods] = useState(initialFoods);
	const [foodCategories, setFoodCategories] = useState(initialCategories);
	const [showAddFood, setShowAddFood] = useState(false);
	const [newFoodData, setNewFoodData] = useState({
		name: "",
		calories: 0,
		protein: 0,
		carbs: 0,
		fat: 0,
		category: "",
	});
	const [showAddCategory, setShowAddCategory] = useState(false);
	const [newCategoryName, setNewCategoryName] = useState("");

	const [formData, setFormData] = useState({
		memberId: "",
		name: "",
		description: "",
		dietTypeId: "",
		calorieTarget: 0,
		proteinTarget: 0,
		carbTarget: 0,
		fatTarget: 0,
		startDate: "",
		endDate: "",
	});

	const [meals, setMeals] = useState<Meal[]>([
		{ mealName: "Breakfast", foods: [] },
	]);

	useEffect(() => {
		// Seed default diet types if none exist
		if (dietTypes.length === 0) {
			seedDefaultDietTypes()
				.then(() => {
					// Refresh the diet types
					getDietTypes().then((types) => {
						setDietTypes(
							types.map((type) => ({
								...type,
								description: type.description || undefined,
							}))
						);
					});
				})
				.catch(console.error);
		}

		// Seed default foods if none exist
		if (foods.length === 0) {
			seedDefaultFoods()
				.then(() => {
					// Refresh the foods and categories
					Promise.all([getFoods(), getFoodCategories()]).then(
						([foodsData, categoriesData]) => {
							setFoods(foodsData);
							setFoodCategories(categoriesData);
						}
					);
				})
				.catch(console.error);
		}
	}, [dietTypes.length, foods.length]);

	const handleAddDietType = async () => {
		if (!newTypeName.trim()) return;

		try {
			const result = await createDietType({
				name: newTypeName.trim(),
			});

			setDietTypes((prev) => [
				...prev,
				{
					...result,
					description: result.description || undefined,
				},
			]);
			setFormData((prev) => ({ ...prev, dietTypeId: result.id })); // Auto-select the new type
			setNewTypeName("");
			setShowAddType(false);
			toast.success("Diet type added successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add diet type"
			);
		}
	};

	const handleAddFood = async () => {
		if (!newFoodData.name.trim() || !newFoodData.category.trim()) return;

		try {
			const result = await createFood({
				name: newFoodData.name.trim(),
				calories: newFoodData.calories,
				protein: newFoodData.protein,
				carbs: newFoodData.carbs,
				fat: newFoodData.fat,
				category: newFoodData.category.trim(),
			});

			const transformedResult = {
				...result,
				protein: Number(result.protein),
				carbs: Number(result.carbs),
				fat: Number(result.fat),
			};

			setFoods((prev) => [...prev, transformedResult]);
			// Update categories if new category was added
			if (!foodCategories.includes(result.category)) {
				setFoodCategories((prev) => [...prev, result.category].sort());
			}
			setNewFoodData({
				name: "",
				calories: 0,
				protein: 0,
				carbs: 0,
				fat: 0,
				category: "",
			});
			setShowAddFood(false);
			toast.success("Food added successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add food"
			);
		}
	};

	const handleAddCategory = async () => {
		if (!newCategoryName.trim()) return;

		const categoryName = newCategoryName.trim().toUpperCase();
		if (foodCategories.includes(categoryName)) {
			toast.error("Category already exists");
			return;
		}

		setFoodCategories((prev) => [...prev, categoryName].sort());
		setNewCategoryName("");
		setShowAddCategory(false);
		toast.success("Category added successfully");
	};

	const categories = ["ALL", ...foodCategories];

	const filteredFoods =
		selectedCategory === "ALL"
			? foods
			: foods.filter((food) => food.category === selectedCategory);

	const addMeal = () => {
		setMeals([...meals, { mealName: "", foods: [] }]);
	};

	const removeMeal = (mealIndex: number) => {
		setMeals(meals.filter((_, i) => i !== mealIndex));
	};

	const updateMeal = (
		mealIndex: number,
		field: keyof Meal,
		value: string | FoodItem[]
	) => {
		const updated = [...meals];
		updated[mealIndex] = { ...updated[mealIndex], [field]: value };
		setMeals(updated);
	};

	const addFoodToMeal = (mealIndex: number, foodName: string) => {
		const updated = [...meals];
		updated[mealIndex].foods.push({ foodName, portion: 1, unit: "serving" });
		setMeals(updated);
	};

	const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
		const updated = [...meals];
		updated[mealIndex].foods = updated[mealIndex].foods.filter(
			(_, i) => i !== foodIndex
		);
		setMeals(updated);
	};

	const updateFood = (
		mealIndex: number,
		foodIndex: number,
		field: keyof FoodItem,
		value: string | number
	) => {
		const updated = [...meals];
		updated[mealIndex].foods[foodIndex] = {
			...updated[mealIndex].foods[foodIndex],
			[field]: value,
		};
		setMeals(updated);
	};

	const calculateMacros = () => {
		let totalCalories = 0;
		let totalProtein = 0;
		let totalCarbs = 0;
		let totalFat = 0;

		meals.forEach((meal) => {
			meal.foods.forEach((foodItem) => {
				const food = foods.find((f) => f.name === foodItem.foodName);
				if (food) {
					let multiplier = foodItem.portion || 1;

					// For different units, we assume the portion represents equivalent servings
					// This is a simplification since we don't have serving size data
					// In a real app, you'd need proper unit conversion tables
					switch (foodItem.unit) {
						case "serving":
							multiplier = foodItem.portion || 1;
							break;
						case "grams":
							// Assume nutritional values are per 100g for simplicity
							// This is approximate and should be replaced with proper serving sizes
							multiplier = (foodItem.portion || 100) / 100;
							break;
						case "cup":
							// Approximate: assume 1 cup ≈ 2 servings for most foods
							multiplier = (foodItem.portion || 1) * 2;
							break;
						case "piece":
							// Assume 1 piece = 1 serving
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
			if (!formData.memberId) {
				toast.error("Please select a member");
				return;
			}

			if (!formData.name.trim()) {
				toast.error("Please enter a diet plan name");
				return;
			}

			if (meals.length === 0 || meals.every((m) => m.foods.length === 0)) {
				toast.error("Please add at least one meal with foods");
				return;
			}

			// Transform meals data to match schema
			const transformedMeals = meals.map((meal) => ({
				mealTime: meal.mealName,
				items: meal.foods.map((food) => ({
					foodName: food.foodName,
					portion: food.portion,
					unit: food.unit,
				})),
				calories: 0, // Will be calculated server-side if needed
				protein: 0,
				carbs: 0,
				fats: 0,
				notes: "",
			}));

			const result = await createDietPlan({
				...formData,
				startDate: formData.startDate
					? new Date(formData.startDate)
					: undefined,
				endDate: formData.endDate ? new Date(formData.endDate) : undefined,
				meals: transformedMeals,
			});

			if (result.success) {
				toast.success("Diet plan created successfully");
				router.push("/diets");
				router.refresh();
			} else {
				toast.error(result.error || "Failed to create diet plan");
			}
		} catch (error) {
			console.error("Error creating diet plan:", error);
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

					<div className="space-y-2">
						<Label htmlFor="dietType">Diet Type</Label>
						<div className="flex gap-2">
							<Select
								value={formData.dietTypeId}
								onValueChange={(value) =>
									setFormData((prev) => ({ ...prev, dietTypeId: value }))
								}
							>
								<SelectTrigger className="w-64">
									<SelectValue placeholder="Select diet type" />
								</SelectTrigger>
								<SelectContent>
									{dietTypes.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setShowAddType(!showAddType)}
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Type
							</Button>
						</div>

						{showAddType && (
							<div className="space-y-2 p-3 border rounded-lg bg-gray-50">
								<div>
									<Label htmlFor="newTypeName">Type Name *</Label>
									<Input
										id="newTypeName"
										value={newTypeName}
										onChange={(e) => setNewTypeName(e.target.value)}
										placeholder="Enter diet type name"
									/>
								</div>
								<div className="flex gap-2">
									<Button
										type="button"
										size="sm"
										onClick={handleAddDietType}
										disabled={!newTypeName.trim()}
									>
										Add Type
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => {
											setShowAddType(false);
											setNewTypeName("");
										}}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="calorieTarget">Daily Calorie Target</Label>
						<Input
							id="calorieTarget"
							type="number"
							value={formData.calorieTarget || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									calorieTarget: parseInt(e.target.value) || 0,
								})
							}
							placeholder="e.g., 2000"
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="proteinTarget">Protein Target (g)</Label>
							<Input
								id="proteinTarget"
								type="number"
								value={formData.proteinTarget || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										proteinTarget: parseInt(e.target.value) || 0,
									})
								}
								placeholder="e.g., 150"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="carbTarget">Carbs Target (g)</Label>
							<Input
								id="carbTarget"
								type="number"
								value={formData.carbTarget || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										carbTarget: parseInt(e.target.value) || 0,
									})
								}
								placeholder="e.g., 200"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="fatTarget">Fat Target (g)</Label>
							<Input
								id="fatTarget"
								type="number"
								value={formData.fatTarget || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										fatTarget: parseInt(e.target.value) || 0,
									})
								}
								placeholder="e.g., 60"
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Meal Plan</CardTitle>
						<Button type="button" onClick={addMeal} size="sm" variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Add Meal
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{meals.map((meal, mealIndex) => (
						<div key={mealIndex} className="border rounded-lg p-4 space-y-4">
							<div className="flex items-start justify-between">
								<div className="flex-1 space-y-4">
									<div className="flex gap-4 items-end">
										<div className="flex-1 space-y-2">
											<Label>Meal Name</Label>
											<Input
												value={meal.mealName}
												onChange={(e) =>
													updateMeal(mealIndex, "mealName", e.target.value)
												}
												placeholder="e.g., Breakfast, Lunch, Snack"
											/>
										</div>
										{meals.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => removeMeal(mealIndex)}
											>
												<Trash2 className="h-4 w-4 text-red-600" />
											</Button>
										)}
									</div>

									<div className="space-y-3">
										{meal.foods.map((food, foodIndex) => {
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
																updateFood(mealIndex, foodIndex, "unit", value)
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
															removeFoodFromMeal(mealIndex, foodIndex)
														}
													>
														<Trash2 className="h-4 w-4 text-red-600" />
													</Button>
												</div>
											);
										})}
									</div>

									<div className="border-t pt-3">
										<div className="flex items-center justify-between mb-2">
											<Label>Add Food to Meal</Label>
											<div className="flex gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setShowAddFood(true)}
												>
													<Plus className="h-4 w-4 mr-1" />
													Add Food
												</Button>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => setShowAddCategory(true)}
												>
													<Plus className="h-4 w-4 mr-1" />
													Add Category
												</Button>
											</div>
										</div>
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
													onClick={() => addFoodToMeal(mealIndex, food.name)}
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

					{meals.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							<UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-50" />
							<p>No meals added yet. Click &quot;Add Meal&quot; to start.</p>
						</div>
					)}
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

			{/* Add Food Dialog */}
			{showAddFood && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold mb-4">Add New Food</h3>
						<div className="space-y-4">
							<div>
								<Label htmlFor="foodName">Food Name *</Label>
								<Input
									id="foodName"
									value={newFoodData.name}
									onChange={(e) =>
										setNewFoodData((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="e.g., Chicken Breast"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="foodCalories">Calories</Label>
									<Input
										id="foodCalories"
										type="number"
										value={newFoodData.calories || ""}
										onChange={(e) =>
											setNewFoodData((prev) => ({
												...prev,
												calories: parseInt(e.target.value) || 0,
											}))
										}
										placeholder="165"
									/>
								</div>
								<div>
									<Label htmlFor="foodCategory">Category *</Label>
									<Select
										value={newFoodData.category}
										onValueChange={(value) =>
											setNewFoodData((prev) => ({ ...prev, category: value }))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{foodCategories.map((cat) => (
												<SelectItem key={cat} value={cat}>
													{cat}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div>
									<Label htmlFor="foodProtein">Protein (g)</Label>
									<Input
										id="foodProtein"
										type="number"
										step="0.1"
										value={newFoodData.protein || ""}
										onChange={(e) =>
											setNewFoodData((prev) => ({
												...prev,
												protein: parseFloat(e.target.value) || 0,
											}))
										}
										placeholder="31"
									/>
								</div>
								<div>
									<Label htmlFor="foodCarbs">Carbs (g)</Label>
									<Input
										id="foodCarbs"
										type="number"
										step="0.1"
										value={newFoodData.carbs || ""}
										onChange={(e) =>
											setNewFoodData((prev) => ({
												...prev,
												carbs: parseFloat(e.target.value) || 0,
											}))
										}
										placeholder="0"
									/>
								</div>
								<div>
									<Label htmlFor="foodFat">Fat (g)</Label>
									<Input
										id="foodFat"
										type="number"
										step="0.1"
										value={newFoodData.fat || ""}
										onChange={(e) =>
											setNewFoodData((prev) => ({
												...prev,
												fat: parseFloat(e.target.value) || 0,
											}))
										}
										placeholder="3.6"
									/>
								</div>
							</div>
							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowAddFood(false);
										setNewFoodData({
											name: "",
											calories: 0,
											protein: 0,
											carbs: 0,
											fat: 0,
											category: "",
										});
									}}
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={handleAddFood}
									disabled={
										!newFoodData.name.trim() || !newFoodData.category.trim()
									}
								>
									Add Food
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Add Category Dialog */}
			{showAddCategory && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold mb-4">Add New Category</h3>
						<div className="space-y-4">
							<div>
								<Label htmlFor="categoryName">Category Name *</Label>
								<Input
									id="categoryName"
									value={newCategoryName}
									onChange={(e) => setNewCategoryName(e.target.value)}
									placeholder="e.g., DAIRY, BEVERAGES"
									className="uppercase"
								/>
								<p className="text-sm text-gray-600 mt-1">
									Category names will be automatically converted to uppercase
								</p>
							</div>
							<div className="flex gap-2 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowAddCategory(false);
										setNewCategoryName("");
									}}
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={handleAddCategory}
									disabled={!newCategoryName.trim()}
								>
									Add Category
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="flex gap-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create Diet Plan"}
				</Button>
			</div>
		</form>
	);
}
