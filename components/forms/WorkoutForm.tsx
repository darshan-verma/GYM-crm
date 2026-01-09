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
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { createWorkoutPlan } from "@/lib/actions/workouts";
import {
	createFitnessGoal,
	getFitnessGoals,
	seedDefaultFitnessGoals,
} from "@/lib/actions/fitness-goals";
import { exerciseLibrary } from "@/lib/data/exercise-library";
import {
	createExercise,
	getExercises,
	seedDefaultExercises,
} from "@/lib/actions/exercises";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface WorkoutFormProps {
	members: Array<{ id: string; name: string; membershipNumber: string }>;
	fitnessGoals: Array<{
		id: string;
		name: string;
		description?: string;
		isDefault: boolean;
	}>;
	exercises: Array<{
		id: string;
		name: string;
		category: string;
		equipment: string;
		difficulty: string;
		isDefault: boolean;
	}>;
}

export function WorkoutForm({
	members,
	fitnessGoals: initialFitnessGoals,
	exercises: initialExercises,
}: WorkoutFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [fitnessGoals, setFitnessGoals] = useState(initialFitnessGoals);
	const [showAddGoal, setShowAddGoal] = useState(false);
	const [newGoalName, setNewGoalName] = useState("");
	const [exercisesList, setExercisesList] = useState(initialExercises);
	const [newExercise, setNewExercise] = useState({
		name: "",
		category: "Chest",
		equipment: "Bodyweight",
		difficulty: "BEGINNER",
	});

	useEffect(() => {
		// Seed default fitness goals if none exist
		if (fitnessGoals.length === 0) {
			seedDefaultFitnessGoals()
				.then(() => {
					// Refresh the fitness goals
					getFitnessGoals().then((goals) => {
						setFitnessGoals(
							goals.map((goal) => ({
								...goal,
								description: goal.description || undefined,
							}))
						);
					});
				})
				.catch(console.error);
		}
	}, [fitnessGoals.length]);

	useEffect(() => {
		// Seed default exercises if none exist
		if (exercisesList.length === 0) {
			seedDefaultExercises()
				.then(() => {
					// Refresh the exercises
					getExercises().then(setExercisesList);
				})
				.catch(console.error);
		}
	}, [exercisesList.length]);

	const [formData, setFormData] = useState({
		memberId: "",
		name: "",
		description: "",
		difficulty: "BEGINNER",
		goalId: "",
		startDate: new Date().toISOString().split("T")[0],
		endDate: "",
	});

	const [exercises, setExercises] = useState<
		Array<{
			name: string;
			sets: number;
			reps: number;
			weight: number;
			restTime: number;
			notes: string;
		}>
	>([
		{
			name: "",
			sets: 3,
			reps: 10,
			weight: 0,
			restTime: 60,
			notes: "",
		},
	]);

	const [selectedCategory, setSelectedCategory] = useState("All");
	const categories = [
		"All",
		"Chest",
		"Back",
		"Legs",
		"Shoulders",
		"Arms",
		"Core",
		"Cardio",
	];

	const handleAddFitnessGoal = async () => {
		if (!newGoalName.trim()) return;

		try {
			const result = await createFitnessGoal({
				name: newGoalName.trim(),
			});

			setFitnessGoals((prev) => [
				...prev,
				{
					...result,
					description: result.description || undefined,
				},
			]);
			setFormData((prev) => ({ ...prev, goalId: result.id })); // Auto-select the new goal
			setNewGoalName("");
			setShowAddGoal(false);
			toast.success("Fitness goal added successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add fitness goal"
			);
		}
	};

	const handleAddExercise = async () => {
		if (!newExercise.name.trim()) {
			toast.error("Please enter an exercise name");
			return;
		}

		try {
			const result = await createExercise({
				name: newExercise.name.trim(),
				category: newExercise.category,
				equipment: newExercise.equipment,
				difficulty: newExercise.difficulty,
			});

			setExercisesList((prev) => [...prev, result]);
			setNewExercise({
				name: "",
				category: "Chest",
				equipment: "Bodyweight",
				difficulty: "BEGINNER",
			});
			toast.success("Exercise added successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add exercise"
			);
		}
	};

	// Combine database exercises with static library (for backward compatibility)
	const allExercises = [
		...exercisesList.map((ex) => ({
			name: ex.name,
			category: ex.category,
			equipment: ex.equipment,
			difficulty: ex.difficulty,
		})),
		...exerciseLibrary.filter(
			(ex) => !exercisesList.some((dbEx) => dbEx.name === ex.name)
		),
	];

	const filteredExercises =
		selectedCategory === "All"
			? allExercises
			: allExercises.filter((ex) => ex.category === selectedCategory);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (!formData.memberId) {
			setError("Please select a member");
			setLoading(false);
			return;
		}

		if (exercises.some((ex) => !ex.name)) {
			setError("All exercises must have a name");
			setLoading(false);
			return;
		}

		const result = await createWorkoutPlan({
			...formData,
			exercises,
			startDate: new Date(formData.startDate),
			endDate: formData.endDate ? new Date(formData.endDate) : undefined,
		});

		if (result?.success) {
			router.push("/workouts");
			router.refresh();
		} else {
			setError(result?.error || "Something went wrong");
		}
		setLoading(false);
	};

	const addExercise = () => {
		setExercises([
			...exercises,
			{
				name: "",
				sets: 3,
				reps: 10,
				weight: 0,
				restTime: 60,
				notes: "",
			},
		]);
	};

	const removeExercise = (index: number) => {
		setExercises(exercises.filter((_, i) => i !== index));
	};

	const updateExercise = (
		index: number,
		field: string,
		value: string | number | string[]
	) => {
		const updated = [...exercises];
		updated[index] = { ...updated[index], [field]: value };
		setExercises(updated);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{error && (
				<div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label htmlFor="memberId">Member *</Label>
					<Select
						value={formData.memberId}
						onValueChange={(value) =>
							setFormData((prev) => ({ ...prev, memberId: value }))
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select member" />
						</SelectTrigger>
						<SelectContent>
							{members.map((member) => (
								<SelectItem key={member.id} value={member.id}>
									{member.name} ({member.membershipNumber})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="name">Plan Name *</Label>
					<Input
						id="name"
						value={formData.name}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, name: e.target.value }))
						}
						placeholder="e.g. Upper Body Strength"
						required
					/>
				</div>

				<div className="md:col-span-2 space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						value={formData.description}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, description: e.target.value }))
						}
						placeholder="Brief description of the workout plan"
						rows={2}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="difficulty">Difficulty Level</Label>
					<Select
						value={formData.difficulty}
						onValueChange={(value) =>
							setFormData((prev) => ({ ...prev, difficulty: value }))
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="BEGINNER">Beginner</SelectItem>
							<SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
							<SelectItem value="ADVANCED">Advanced</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="goal">Fitness Goal</Label>
					<div className="flex gap-2">
						<Select
							value={formData.goalId}
							onValueChange={(value) =>
								setFormData((prev) => ({ ...prev, goalId: value }))
							}
						>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="Select a fitness goal" />
							</SelectTrigger>
							<SelectContent>
								{fitnessGoals.map((goal) => (
									<SelectItem key={goal.id} value={goal.id}>
										{goal.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => setShowAddGoal(!showAddGoal)}
						>
							<Plus className="h-4 w-4 mr-1" />
							Add Goal
						</Button>
					</div>

					{showAddGoal && (
						<div className="space-y-2 p-3 border rounded-lg bg-gray-50">
							<div>
								<Label htmlFor="newGoalName">Goal Name *</Label>
								<Input
									id="newGoalName"
									value={newGoalName}
									onChange={(e) => setNewGoalName(e.target.value)}
									placeholder="Enter goal name"
								/>
							</div>
							<div className="flex gap-2">
								<Button
									type="button"
									size="sm"
									onClick={handleAddFitnessGoal}
									disabled={!newGoalName.trim()}
								>
									Add Goal
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setShowAddGoal(false);
										setNewGoalName("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="startDate">Start Date *</Label>
					<Input
						id="startDate"
						type="date"
						value={formData.startDate}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, startDate: e.target.value }))
						}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="endDate">End Date (Optional)</Label>
					<Input
						id="endDate"
						type="date"
						value={formData.endDate}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, endDate: e.target.value }))
						}
					/>
				</div>
			</div>

			<div className="border-t pt-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Exercises</h3>
					<div className="flex gap-2">
						<Select
							value={selectedCategory}
							onValueChange={setSelectedCategory}
						>
							<SelectTrigger className="w-40">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{categories.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button type="button" onClick={addExercise} variant="outline">
							<Plus className="h-4 w-4 mr-2" />
							Add Exercise
						</Button>
					</div>
				</div>

				<div className="space-y-4">
					{exercises.map((exercise, index) => (
						<div key={index} className="p-4 border rounded-lg space-y-4">
							<div className="flex items-start justify-between">
								<div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="md:col-span-3">
										<Label>Exercise Name *</Label>
										<div className="flex gap-2">
											<Select
												value={exercise.name}
												onValueChange={(value) =>
													updateExercise(index, "name", value)
												}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select exercise" />
												</SelectTrigger>
												<SelectContent>
													{filteredExercises.map((ex) => (
														<SelectItem key={ex.name} value={ex.name}>
															{ex.name} ({ex.equipment})
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Dialog>
												<DialogTrigger asChild>
													<Button type="button" variant="outline" size="sm">
														<Plus className="h-4 w-4 mr-1" />
														Add Exercise
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Add New Exercise</DialogTitle>
														<DialogDescription>
															Add a new exercise to the library
														</DialogDescription>
													</DialogHeader>
													<div className="space-y-4">
														<div className="space-y-2">
															<Label htmlFor="exerciseName">
																Exercise Name *
															</Label>
															<Input
																id="exerciseName"
																value={newExercise.name}
																onChange={(e) =>
																	setNewExercise((prev) => ({
																		...prev,
																		name: e.target.value,
																	}))
																}
																placeholder="e.g. Bench Press"
															/>
														</div>
														<div className="space-y-2">
															<Label htmlFor="exerciseCategory">
																Category *
															</Label>
															<Select
																value={newExercise.category}
																onValueChange={(value) =>
																	setNewExercise((prev) => ({
																		...prev,
																		category: value,
																	}))
																}
															>
																<SelectTrigger>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{categories
																		.filter((cat) => cat !== "All")
																		.map((cat) => (
																			<SelectItem key={cat} value={cat}>
																				{cat}
																			</SelectItem>
																		))}
																</SelectContent>
															</Select>
														</div>
														<div className="space-y-2">
															<Label htmlFor="exerciseEquipment">
																Equipment *
															</Label>
															<Select
																value={newExercise.equipment}
																onValueChange={(value) =>
																	setNewExercise((prev) => ({
																		...prev,
																		equipment: value,
																	}))
																}
															>
																<SelectTrigger>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="Bodyweight">
																		Bodyweight
																	</SelectItem>
																	<SelectItem value="Barbell">
																		Barbell
																	</SelectItem>
																	<SelectItem value="Dumbbell">
																		Dumbbell
																	</SelectItem>
																	<SelectItem value="Cable">Cable</SelectItem>
																	<SelectItem value="Machine">
																		Machine
																	</SelectItem>
																	<SelectItem value="Equipment">
																		Equipment
																	</SelectItem>
																</SelectContent>
															</Select>
														</div>
														<div className="space-y-2">
															<Label htmlFor="exerciseDifficulty">
																Difficulty *
															</Label>
															<Select
																value={newExercise.difficulty}
																onValueChange={(value) =>
																	setNewExercise((prev) => ({
																		...prev,
																		difficulty: value,
																	}))
																}
															>
																<SelectTrigger>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value="BEGINNER">
																		Beginner
																	</SelectItem>
																	<SelectItem value="INTERMEDIATE">
																		Intermediate
																	</SelectItem>
																	<SelectItem value="ADVANCED">
																		Advanced
																	</SelectItem>
																</SelectContent>
															</Select>
														</div>
													</div>
													<DialogFooter>
														<Button
															type="button"
															variant="outline"
															onClick={() => {
																setNewExercise({
																	name: "",
																	category: "Chest",
																	equipment: "Bodyweight",
																	difficulty: "BEGINNER",
																});
															}}
														>
															Cancel
														</Button>
														<Button
															type="button"
															onClick={handleAddExercise}
															disabled={!newExercise.name.trim()}
														>
															Add Exercise
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
											{exercises.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => removeExercise(index)}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											)}
										</div>
									</div>

									<div>
										<Label>Sets</Label>
										<Input
											type="number"
											min="1"
											value={exercise.sets}
											onChange={(e) =>
												updateExercise(
													index,
													"sets",
													parseInt(e.target.value) || 0
												)
											}
										/>
									</div>

									<div>
										<Label>Reps</Label>
										<Input
											type="number"
											min="1"
											value={exercise.reps}
											onChange={(e) =>
												updateExercise(
													index,
													"reps",
													parseInt(e.target.value) || 0
												)
											}
										/>
									</div>

									<div>
										<Label>Weight (kg)</Label>
										<Input
											type="number"
											min="0"
											step="0.5"
											value={exercise.weight}
											onChange={(e) =>
												updateExercise(
													index,
													"weight",
													parseFloat(e.target.value) || 0
												)
											}
										/>
									</div>

									<div className="md:col-span-2">
										<Label>Rest Time (seconds)</Label>
										<Input
											type="number"
											min="0"
											value={exercise.restTime}
											onChange={(e) =>
												updateExercise(
													index,
													"restTime",
													parseInt(e.target.value) || 0
												)
											}
										/>
									</div>

									<div className="md:col-span-3">
										<Label>Notes</Label>
										<Input
											value={exercise.notes}
											onChange={(e) =>
												updateExercise(index, "notes", e.target.value)
											}
											placeholder="Form tips, modifications, etc."
										/>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="flex gap-3">
				<Button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create Workout Plan"}
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/workouts")}
					disabled={loading}
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
