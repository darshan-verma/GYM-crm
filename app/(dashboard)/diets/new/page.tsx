import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import DietForm from "@/components/forms/DietForm";
import { getDietTypes } from "@/lib/actions/diet-types";
import { getFoods, getFoodCategories } from "@/lib/actions/foods";

export default async function NewDietPage() {
	const session = await auth();
	if (!session) {
		redirect("/login");
	}

	const [members, dietTypes, foods, foodCategories] = await Promise.all([
		prisma.member.findMany({
			select: {
				id: true,
				name: true,
				email: true,
			},
			orderBy: { name: "asc" },
		}),
		getDietTypes(),
		getFoods(),
		getFoodCategories(),
	]);

	// Transform dietTypes to match the expected interface
	const transformedDietTypes = dietTypes.map((type) => ({
		...type,
		description: type.description || undefined,
	}));

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Create Diet Plan</h1>
				<p className="text-gray-600 mt-1">
					Design a personalized nutrition plan for your member
				</p>
			</div>

			<DietForm
				members={members}
				dietTypes={transformedDietTypes}
				foods={foods}
				foodCategories={foodCategories}
			/>
		</div>
	);
}
