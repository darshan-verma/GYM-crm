import { notFound } from "next/navigation";
import { getTrainerById } from "@/lib/actions/trainers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TrainerForm from "@/components/forms/TrainerForm";

export default async function EditTrainerPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trainer = await getTrainerById(id);

	if (!trainer) {
		notFound();
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href={`/trainers/${trainer.id}`}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Trainer
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Edit Trainer</h1>
					<p className="text-muted-foreground mt-1">
						Update trainer information
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Trainer Information</CardTitle>
				</CardHeader>
				<CardContent>
					<TrainerForm isEdit={true} initialData={trainer} />
				</CardContent>
			</Card>
		</div>
	);
}
