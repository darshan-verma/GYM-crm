"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Users,
	CreditCard,
	UserCheck,
	Calendar,
	Megaphone,
	Dumbbell,
	UtensilsCrossed,
	BarChart3,
	Settings,
	Menu,
	X,
	LogOut,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

import { hasSpecificPermission } from "@/lib/utils/permissions";
import { Permission } from "@prisma/client";

const navigation = [
	{
		name: "Dashboard",
		href: "/",
		icon: LayoutDashboard,
		permission: Permission.VIEW_DASHBOARD,
	},
	{
		name: "Leads",
		href: "/leads",
		icon: Megaphone,
		permission: Permission.VIEW_LEADS,
	},
	{
		name: "Members",
		href: "/members",
		icon: Users,
		permission: Permission.VIEW_MEMBERS,
	},
	{
		name: "Billing",
		href: "/billing",
		icon: CreditCard,
		permission: Permission.VIEW_BILLING,
	},
	{
		name: "Trainers",
		href: "/trainers",
		icon: UserCheck,
		permission: Permission.VIEW_STAFF,
	},
	{
		name: "Staff",
		href: "/staff",
		icon: Shield,
		permission: Permission.VIEW_STAFF,
	},
	{
		name: "Attendance",
		href: "/attendance",
		icon: Calendar,
		permission: Permission.VIEW_ATTENDANCE,
	},
	
	{
		name: "Memberships",
		href: "/memberships",
		icon: CreditCard,
		permission: Permission.VIEW_BILLING,
	},
	{
		name: "Workouts",
		href: "/workouts",
		icon: Dumbbell,
		permission: Permission.VIEW_WORKOUTS,
	},
	{
		name: "Diet Plans",
		href: "/diets",
		icon: UtensilsCrossed,
		permission: Permission.VIEW_DIETS,
	},
	{
		name: "Reports",
		href: "/reports",
		icon: BarChart3,
		permission: Permission.VIEW_REPORTS,
	},
	{
		name: "Settings",
		href: "/settings",
		icon: Settings,
		permission: Permission.VIEW_SETTINGS,
	},
];

export default function Sidebar({
	user,
	gymTitle = "Pro Bodyline",
}: {
	user: {
		id: string;
		name?: string | null;
		email?: string | null;
		role: string;
		image?: string | null;
		permissions?: Permission[];
	};
	gymTitle?: string;
}) {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
						<Dumbbell className="w-5 h-5 text-white" />
					</div>
					<span className="font-bold text-lg">{gymTitle}</span>
				</div>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
				>
					{mobileMenuOpen ? <X /> : <Menu />}
				</Button>
			</div>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
					mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="h-16 flex items-center gap-3 px-6 border-b">
						<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
							<Dumbbell className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="font-bold text-lg leading-tight">{gymTitle}</h1>
							<p className="text-xs text-muted-foreground">Fitness CRM</p>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 overflow-y-auto p-4 space-y-1">
						{navigation
							.filter(
								(item) =>
									!user?.permissions ||
									user.permissions.length === 0 ||
									hasSpecificPermission(user?.permissions, item.permission)
							)
							.map((item) => {
								const isActive =
									pathname === item.href ||
									(item.href !== "/" && pathname.startsWith(item.href));

								return (
									<Link
										key={item.name}
										href={item.href}
										onClick={() => setMobileMenuOpen(false)}
										className={cn(
											"flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
											isActive
												? "bg-blue-50 text-blue-700 shadow-sm"
												: "text-gray-700 hover:bg-gray-50"
										)}
									>
										<item.icon
											className={cn(
												"w-5 h-5",
												isActive ? "text-blue-700" : "text-gray-500"
											)}
										/>
										{item.name}
									</Link>
								);
							})}
					</nav>

					{/* User Profile */}
					<div className="p-4 border-t">
						<div className="flex items-center gap-3 mb-3">
							<Avatar>
								<AvatarImage src={user?.image || undefined} />
								<AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
									{(user?.name || user?.email || "U").charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">
									{user?.name || user?.email || "User"}
								</p>
								<p className="text-xs text-muted-foreground truncate">
									{user?.email || ""}
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => signOut({ callbackUrl: "/login" })}
						>
							<LogOut className="w-4 h-4 mr-2" />
							Logout
						</Button>
					</div>
				</div>
			</aside>

			{/* Mobile overlay */}
			{mobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}
		</>
	);
}
