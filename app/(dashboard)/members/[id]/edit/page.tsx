import { notFound } from "next/navigation";
import { getMemberById, getTrainers } from "@/lib/actions/members";
import MemberForm, { Member } from "@/components/forms/MemberForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditMemberPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [member, trainers] = await Promise.all([
		getMemberById(id),
		getTrainers(),
	]);

	if (!member) {
		notFound();
	}

	return (
		<div className="space-y-6 max-w-4xl">
			{/* Header */}
			<div>
				<Button variant="ghost" size="sm" asChild className="mb-4">
					<Link href={`/members/${member.id}`}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Member Profile
					</Link>
				</Button>
				<h1 className="text-3xl font-bold">Edit Member</h1>
				<p className="text-muted-foreground mt-1">
					Update {member.name}&apos;s profile information
				</p>
			</div>

			{/* Form Card */}
			<Card>
				<CardHeader>
					<CardTitle>Member Information</CardTitle>
					<CardDescription>
						Update the member&apos;s personal and contact details
					</CardDescription>
				</CardHeader>
				<CardContent>
					<MemberForm
						trainers={trainers}
						initialData={member as unknown as Member}
						isEdit
					/>
				</CardContent>
			</Card>
		</div>
	);
}
