"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, Clock, DollarSign, UserPlus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getNotifications,
  markNotificationAsRead,
  dismissNotification,
  markAllNotificationsAsRead,
  type NotificationItem,
} from "@/lib/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface NotificationPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationPopup({ open, onOpenChange }: NotificationPopupProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<{
    leads: NotificationItem[];
    payments: NotificationItem[];
    members: NotificationItem[];
  }>({
    leads: [],
    payments: [],
    members: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("leads");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await getNotifications();
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Periodically check for new notifications (every 60 seconds when popup is open)
  useEffect(() => {
    if (!open) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [open]);

  const handleMarkAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      fetchNotifications();
    }
  };

  const handleDismiss = async (notificationId: string) => {
    const result = await dismissNotification(notificationId);
    if (result.success) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead();
    if (result.success) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read
    if (notification.status === "UNREAD") {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on entity type
    if (notification.entityType === "Lead" && notification.entityId) {
      router.push(`/leads/${notification.entityId}`);
      onOpenChange(false);
    } else if (notification.entityType === "Member" && notification.entityId) {
      router.push(`/members/${notification.entityId}`);
      onOpenChange(false);
    } else if (notification.entityType === "Payment" && notification.entityId) {
      const memberId = notification.metadata?.memberId as string | undefined;
      if (memberId) {
        router.push(`/members/${memberId}`);
        onOpenChange(false);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LEAD_FOLLOW_UP":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "PAYMENT_DUE":
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case "MEMBERSHIP_EXPIRING":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "NEW_MEMBER":
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate actual time remaining from metadata
  const getTimeRemaining = (notification: NotificationItem): string | null => {
    const metadata = notification.metadata;
    if (!metadata) return null;

    let targetDate: Date | null = null;

    // Get target date based on notification type
    if (notification.type === "LEAD_FOLLOW_UP" && metadata.followUpDate) {
      targetDate = new Date(metadata.followUpDate as string);
    } else if (
      (notification.type === "PAYMENT_DUE" || notification.type === "MEMBERSHIP_EXPIRING") &&
      metadata.endDate
    ) {
      targetDate = new Date(metadata.endDate as string);
    }

    if (!targetDate) return null;

    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    
    if (diffMs < 0) {
      return "overdue";
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins === 1 ? "1 minute" : `${diffMins} minutes`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? "1 hour" : `${diffHours} hours`;
    } else {
      return diffDays === 1 ? "1 day" : `${diffDays} days`;
    }
  };

  // Update message with actual time remaining
  const getNotificationMessage = (notification: NotificationItem): string => {
    const timeRemaining = getTimeRemaining(notification);
    const metadata = notification.metadata;

    if (!timeRemaining) {
      return notification.message; // Fallback to stored message
    }

    // Update message based on notification type
    switch (notification.type) {
      case "LEAD_FOLLOW_UP": {
        const leadName = (metadata?.leadName as string) || "Lead";
        return `Follow up with ${leadName} in ${timeRemaining}`;
      }
      case "PAYMENT_DUE": {
        const memberName = (metadata?.memberName as string) || "Member";
        return `Payment due for ${memberName} - Membership expires in ${timeRemaining}`;
      }
      case "MEMBERSHIP_EXPIRING": {
        const memberName = (metadata?.memberName as string) || "Member";
        return `${memberName}'s membership expires in ${timeRemaining}`;
      }
      default:
        return notification.message;
    }
  };

  const NotificationItem = ({ notification }: { notification: NotificationItem }) => {
    // Update time every minute for time-sensitive notifications to trigger re-render
    const [, setTick] = useState(0);
    
    useEffect(() => {
      const hasTimeSensitive = ["LEAD_FOLLOW_UP", "PAYMENT_DUE", "MEMBERSHIP_EXPIRING"].includes(notification.type);
      if (!hasTimeSensitive) return;

      const interval = setInterval(() => {
        // Force re-render to recalculate time remaining
        setTick((prev) => prev + 1);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }, [notification.type]);

    const dynamicMessage = getNotificationMessage(notification);
    const timeRemaining = getTimeRemaining(notification);
    const isOverdue = timeRemaining === "overdue";

    return (
      <div
        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
          notification.status === "UNREAD"
            ? isOverdue
              ? "bg-red-50 border-red-200 hover:bg-red-100"
              : "bg-blue-50 border-blue-200 hover:bg-blue-100"
            : isOverdue
            ? "bg-red-50 border-red-100 hover:bg-red-50"
            : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className={`text-xs mt-1 ${isOverdue ? "text-red-700 font-medium" : "text-gray-600"}`}>
                  {dynamicMessage}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {notification.status === "UNREAD" && (
                  <Badge 
                    variant="default" 
                    className={`text-white text-[10px] px-1.5 py-0 ${
                      isOverdue ? "bg-red-500" : "bg-blue-500"
                    }`}
                  >
                    New
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="default" className="bg-red-500 text-white text-[10px] px-1.5 py-0">
                    Overdue
                  </Badge>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(notification.id);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leads" className="relative">
              Leads
              {notifications.leads.filter((n) => n.status === "UNREAD").length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0">
                  {notifications.leads.filter((n) => n.status === "UNREAD").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              Payments
              {notifications.payments.filter((n) => n.status === "UNREAD").length > 0 && (
                <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0">
                  {notifications.payments.filter((n) => n.status === "UNREAD").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="members" className="relative">
              Members
              {notifications.members.filter((n) => n.status === "UNREAD").length > 0 && (
                <Badge className="ml-2 bg-green-500 text-white text-[10px] px-1.5 py-0">
                  {notifications.members.filter((n) => n.status === "UNREAD").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 space-y-2">
            <TabsContent value="leads" className="mt-0">
              {loading ? (
                <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
              ) : notifications.leads.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No lead notifications
                </div>
              ) : (
                notifications.leads.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              {loading ? (
                <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
              ) : notifications.payments.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No payment notifications
                </div>
              ) : (
                notifications.payments.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>

            <TabsContent value="members" className="mt-0">
              {loading ? (
                <div className="text-center py-8 text-sm text-gray-500">Loading...</div>
              ) : notifications.members.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  No member notifications
                </div>
              ) : (
                notifications.members.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
