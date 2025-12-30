import { notFound } from "next/navigation";
import { getTrainerById } from "@/lib/actions/trainers";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Users, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber, formatDate } from "@/lib/utils/format";

export default async function TrainerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const trainer = await getTrainerById(id);

	if (!trainer) {
		notFound();
	}

	const activeMembers = trainer.trainedMembers.filter(
		(m) => m.status === "ACTIVE"
	);

	return (
		<div className="space-y-6">
			{/* Back Button */}
			<Button variant="ghost" size="sm" asChild>
				<Link href="/trainers">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Trainers
				</Link>
			</Button>

			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-4">
					<Avatar className="h-20 w-20">
						<AvatarImage src={trainer.avatar || undefined} />
						<AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl">
							{trainer.name.charAt(0)}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-3xl font-bold">{trainer.name}</h1>
						<Badge
							variant="outline"
							className="mt-2 bg-blue-50 text-blue-700 border-blue-200"
						>
							Trainer
						</Badge>
					</div>
				</div>
				<Button variant="outline" asChild>
					<Link href={`/trainers/${trainer.id}/edit`}>
						<Edit className="w-4 h-4 mr-2" />
						Edit
					</Link>
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Contact Information */}
				<Card>
					<CardHeader>
						<CardTitle>Contact Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{trainer.email && (
							<div className="flex items-center gap-3">
								<Mail className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Email</p>
									<p className="font-medium">{trainer.email}</p>
								</div>
							</div>
						)}
						{trainer.phone && (
							<div className="flex items-center gap-3">
								<Phone className="w-4 h-4 text-muted-foreground" />
								<div>
									<p className="text-sm text-muted-foreground">Phone</p>
									<p className="font-medium">
										{formatPhoneNumber(trainer.phone)}
									</p>
								</div>
							</div>
						)}
						<div>
							<p className="text-sm text-muted-foreground">Joined</p>
							<p className="font-medium">{formatDate(trainer.createdAt)}</p>
						</div>
					</CardContent>
				</Card>

				{/* Stats */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Statistics</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="p-4 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-600 font-medium">
									Total Members
								</p>
								<p className="text-3xl font-bold text-blue-700 mt-1">
									{trainer._count.trainedMembers}
								</p>
							</div>
							<div className="p-4 bg-green-50 rounded-lg">
								<p className="text-sm text-green-600 font-medium">
									Active Members
								</p>
								<p className="text-3xl font-bold text-green-700 mt-1">
									{activeMembers.length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Assigned Members */}
			<Card>
				<CardHeader>
					<CardTitle>Assigned Members</CardTitle>
					<CardDescription>
						{trainer._count.trainedMembers} members assigned to this trainer
					</CardDescription>
				</CardHeader>
				<CardContent>
					{trainer.trainedMembers.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">
							No members assigned yet
						</p>
					) : (
						<div className="space-y-3">
							{trainer.trainedMembers.map((member) => {
								const activeMembership = member.memberships[0];

								return (
									<Link
										key={member.id}
										href={`/members/${member.id}`}
										className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarImage src={member.photo || undefined} />
												<AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
													{member.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{member.name}</p>
												<p className="text-sm text-muted-foreground">
													{member.membershipNumber} •{" "}
													{formatPhoneNumber(member.phone)}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<Badge
												variant="outline"
												className={
													member.status === "ACTIVE"
														? "bg-green-100 text-green-800 border-green-200"
														: "bg-red-100 text-red-800 border-red-200"
												}
											>
												{member.status}
											</Badge>
											{activeMembership && (
												<p className="text-sm text-muted-foreground">
													{activeMembership.plan.name}
												</p>
											)}
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
