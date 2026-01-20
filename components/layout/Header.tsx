"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationPopup from "./NotificationPopup";
import { getNotifications } from "@/lib/actions/notifications";
import { useNotificationChecker } from "./useNotificationChecker";

interface User {
	id: string;
	name?: string | null;
	email?: string | null;
	role: string;
}

export default function Header({ user: _user }: { user?: User }) {
	const [notificationOpen, setNotificationOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	// Periodically check for new notifications
	useNotificationChecker();

	const fetchUnreadCount = useCallback(async () => {
		try {
			const result = await getNotifications();
			if (result.success) {
				setUnreadCount(result.unreadCount);
			}
		} catch (error) {
			console.error("Failed to fetch notification count:", error);
		}
	}, []);

	useEffect(() => {
		// Fetch unread count on mount (deferred to avoid setState in effect warning)
		const timeoutId = setTimeout(() => {
			fetchUnreadCount();
		}, 0);

		// Refresh unread count every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);

		return () => {
			clearTimeout(timeoutId);
			clearInterval(interval);
		};
	}, [fetchUnreadCount]);

	return (
		<>
			<header className="sticky top-0 z-30 h-16 bg-white border-b px-4 lg:px-8 flex items-center gap-4">
				{/* Search */}
				<div className="flex-1 max-w-md">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search members, payments..."
							className="pl-9 h-10"
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					{/* Notifications */}
					<Button
						variant="ghost"
						size="icon"
						className="relative"
						onClick={() => setNotificationOpen(true)}
					>
						<Bell className="w-5 h-5" />
						{unreadCount > 0 && (
							<Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
								{unreadCount > 99 ? "99+" : unreadCount}
							</Badge>
						)}
					</Button>
				</div>
			</header>

			<NotificationPopup
				open={notificationOpen}
				onOpenChange={(open) => {
					setNotificationOpen(open);
					if (!open) {
						// Refresh count when closing
						fetchUnreadCount();
					}
				}}
			/>
		</>
	);
}
