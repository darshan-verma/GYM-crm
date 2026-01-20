"use client";

import { useEffect } from "react";

// Hook to periodically check and create notifications
// This calls the API endpoint that checks for new notifications
export function useNotificationChecker() {
  useEffect(() => {
    // Function to check notifications
    const checkNotifications = async () => {
      try {
        await fetch("/api/notifications/check", {
          method: "GET",
        });
      } catch (error) {
        console.error("Failed to check notifications:", error);
      }
    };

    // Check immediately on mount
    checkNotifications();

    // Then check every 10 minutes
    const interval = setInterval(checkNotifications, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
