import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import TrainerForm from "@/components/forms/TrainerForm";

export default function NewTrainerPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link href="/trainers">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Trainers
					</Link>
				</Button>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Add Trainer</h1>
					<p className="text-muted-foreground mt-1">
						Create a new trainer account
					</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Trainer Information</CardTitle>
				</CardHeader>
				<CardContent>
					<TrainerForm />
				</CardContent>
			</Card>
		</div>
	);
}
