"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { generateDietPlanPDF } from "@/lib/utils/pdf";

interface FoodItem {
	foodName?: string;
	name?: string;
	portion?: number;
	unit?: string;
}

interface Meal {
	mealTime?: string;
	mealName?: string;
	items?: FoodItem[];
	foods?: FoodItem[];
}

interface DietPlan {
	name: string;
	description?: string | null;
	goal?: string | null;
	totalCalories?: number | null;
	totalProtein?: number | null;
	startDate: Date;
	endDate?: Date | null;
	meals: Meal[] | unknown; // Allow Prisma JsonValue
	member: {
		name: string;
		email?: string | null;
		phone?: string | null;
		membershipNumber: string;
	};
}

interface ExportDietPlanButtonProps {
	plan: DietPlan;
}

export default function ExportDietPlanButton({ plan }: ExportDietPlanButtonProps) {
	const handleExport = () => {
		// Handle both day-wise and flat meal structures
		const meals = Array.isArray(plan.meals) ? (plan.meals as Meal[]) : [];
		
		generateDietPlanPDF({
			name: plan.name,
			description: plan.description || undefined,
			goal: plan.goal || undefined,
			totalCalories: plan.totalCalories || undefined,
			totalProtein: plan.totalProtein || undefined,
			startDate: plan.startDate,
			endDate: plan.endDate || undefined,
			meals: meals,
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
