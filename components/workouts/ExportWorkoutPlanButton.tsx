"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateWorkoutPlanPDF } from "@/lib/utils/pdf";

interface Exercise {
	name: string;
	sets?: number;
	reps?: number;
	weight?: number;
	restTime?: number;
	notes?: string;
}

interface WorkoutPlan {
	name: string;
	description?: string | null;
	difficulty?: string | null;
	goal?: {
		name: string;
	} | null;
	startDate: Date;
	endDate?: Date | null;
	exercises: Exercise[] | unknown; // Allow Prisma JsonValue
	member: {
		name: string;
		email?: string | null;
		phone?: string | null;
		membershipNumber: string;
	};
}

interface ExportWorkoutPlanButtonProps {
	plan: WorkoutPlan;
}

export default function ExportWorkoutPlanButton({
	plan,
}: ExportWorkoutPlanButtonProps) {
	const handleExport = () => {
		// Handle both day-wise and flat exercise structures
		const exercises = Array.isArray(plan.exercises) ? (plan.exercises as Exercise[]) : [];
		
		generateWorkoutPlanPDF({
			name: plan.name,
			description: plan.description || undefined,
			difficulty: plan.difficulty || undefined,
			goal: plan.goal?.name || undefined,
			startDate: plan.startDate,
			endDate: plan.endDate || undefined,
			exercises: exercises,
			memberName: plan.member.name,
			memberEmail: plan.member.email || undefined,
			memberPhone: plan.member.phone || undefined,
			membershipNumber: plan.member.membershipNumber,
		});
	};

	return (
		<Button onClick={handleExport} variant="outline">
			<Download className="h-4 w-4 mr-2" />
			Export PDF
		</Button>
	);
}
