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

const navigation = [
	{
		name: "Dashboard",
		href: "/",
		icon: LayoutDashboard,
		roles: ["ADMIN", "TRAINER", "RECEPTIONIST"],
	},
	{
		name: "Members",
		href: "/members",
		icon: Users,
		roles: ["ADMIN", "TRAINER", "RECEPTIONIST"],
	},
	{
		name: "Billing",
		href: "/billing",
		icon: CreditCard,
		roles: ["ADMIN", "RECEPTIONIST"],
	},
	{ name: "Trainers", href: "/trainers", icon: UserCheck, roles: ["ADMIN"] },
	{ name: "Staff", href: "/staff", icon: Shield, roles: ["ADMIN"] },
	{
		name: "Attendance",
		href: "/attendance",
		icon: Calendar,
		roles: ["ADMIN", "TRAINER", "RECEPTIONIST"],
	},
	{
		name: "Leads",
		href: "/leads",
		icon: Megaphone,
		roles: ["ADMIN", "RECEPTIONIST"],
	},
	{
		name: "Memberships",
		href: "/memberships",
		icon: CreditCard,
		roles: ["ADMIN"],
	},
	{
		name: "Workouts",
		href: "/workouts",
		icon: Dumbbell,
		roles: ["ADMIN", "TRAINER"],
	},
	{
		name: "Diet Plans",
		href: "/diets",
		icon: UtensilsCrossed,
		roles: ["ADMIN", "TRAINER"],
	},
	{ name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
	{ name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function Sidebar({ user }: { user: any }) {
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
					<span className="font-bold text-lg">Pro Bodyline</span>
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
							<h1 className="font-bold text-lg leading-tight">Pro Bodyline</h1>
							<p className="text-xs text-muted-foreground">Fitness CRM</p>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 overflow-y-auto p-4 space-y-1">
						{navigation
							.filter((item) =>
								item.roles.includes(user?.role || "RECEPTIONIST")
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
								<AvatarImage src={user.image} />
								<AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
									{user.name?.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{user.name}</p>
								<p className="text-xs text-muted-foreground truncate">
									{user.email}
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
