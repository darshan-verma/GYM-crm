import { getTrainers } from "@/lib/actions/trainers";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/utils/permissions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/utils/format";

export default async function TrainersPage() {
	const session = await auth();

	if (!requireAdmin(session?.user?.role)) {
		redirect("/");
	}

	const trainers = await getTrainers();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
					<p className="text-muted-foreground mt-1">
						Manage your gym trainers and their assigned members
					</p>
				</div>
				<Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700">
					<Link href="/trainers/new">
						<Plus className="w-4 h-4 mr-2" />
						Add Trainer
					</Link>
				</Button>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-blue-100">
								<Users className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Total Trainers</p>
								<p className="text-2xl font-bold">{trainers.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-green-100">
								<Users className="w-6 h-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Active Trainers</p>
								<p className="text-2xl font-bold">
									{trainers.filter((t) => t._count.trainedMembers > 0).length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-purple-100">
								<Users className="w-6 h-6 text-purple-600" />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									Total Members Trained
								</p>
								<p className="text-2xl font-bold">
									{trainers.reduce(
										(sum, t) => sum + t._count.trainedMembers,
										0
									)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Trainers Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{trainers.map((trainer) => (
					<Card key={trainer.id} className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<Avatar className="h-12 w-12">
										<AvatarImage src={trainer.avatar || undefined} />
										<AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
											{trainer.name.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle className="text-lg">{trainer.name}</CardTitle>
										<Badge
											variant="outline"
											className="mt-1 bg-blue-50 text-blue-700 border-blue-200"
										>
											Trainer
										</Badge>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Contact Info */}
							<div className="space-y-2">
								{trainer.email && (
									<div className="flex items-center gap-2 text-sm">
										<Mail className="w-4 h-4 text-muted-foreground" />
										<span className="truncate">{trainer.email}</span>
									</div>
								)}
								{trainer.phone && (
									<div className="flex items-center gap-2 text-sm">
										<Phone className="w-4 h-4 text-muted-foreground" />
										<span>{formatPhoneNumber(trainer.phone)}</span>
									</div>
								)}
							</div>

							{/* Stats */}
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div>
									<p className="text-sm text-muted-foreground">Members</p>
									<p className="text-xl font-bold">
										{trainer._count.trainedMembers}
									</p>
								</div>
							</div>

							{/* Actions */}
							<Button variant="outline" className="w-full" asChild>
								<Link href={`/trainers/${trainer.id}`}>View Profile</Link>
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{trainers.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-4">No trainers added yet</p>
						<Button asChild>
							<Link href="/trainers/new">
								<Plus className="w-4 h-4 mr-2" />
								Add Your First Trainer
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
