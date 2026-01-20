# Notification System Setup

This document explains how to set up and use the notification system in the Pro Bodyline CRM.

## Features

The notification system provides in-app notifications for:

1. **Leads Tab**: Notifications 2 hours before a lead's follow-up time
2. **Payment Tab**: Notifications 3 days before membership expiration (payment dues)
3. **Members Tab**: 
   - Notifications 3 days before membership expiration
   - Notifications when new members are added

## Setup Instructions

### Step 1: Run Database Migration

First, you need to create the database table for in-app notifications:

```bash
npx prisma migrate dev --name add_in_app_notifications
```

This will:
- Create the `InAppNotification` model in your database
- Add the necessary indexes
- Regenerate Prisma Client with the new types

### Step 2: Verify Prisma Client is Generated

After running the migration, Prisma Client should automatically regenerate. If it doesn't, run:

```bash
npx prisma generate
```

### Step 3: (Optional) Set Up Cron Job for Notifications

To automatically check and create notifications, you can set up a cron job that calls the notification check API.

#### Option A: Using Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/check",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

This will check for notifications every 30 minutes.

#### Option B: Using External Cron Service

Set up a cron job (e.g., via cron-job.org) that calls:
- URL: `https://your-domain.com/api/notifications/check`
- Method: `GET`
- Frequency: Every 30 minutes or as needed

## How It Works

### Notification Types

1. **LEAD_FOLLOW_UP**: Created 2 hours before a lead's `followUpDate`
2. **PAYMENT_DUE**: Created 3 days before an active membership's `endDate`
3. **MEMBERSHIP_EXPIRING**: Created 3 days before an active membership's `endDate`
4. **NEW_MEMBER**: Created automatically when a new member is added

### Notification Checking

The system checks for notifications in the following ways:

1. **Automatic Check on Member Creation**: When a new member is created, a notification is automatically generated.

2. **Periodic API Check**: The `/api/notifications/check` endpoint can be called periodically to check for:
   - Leads with follow-up dates in the next 2 hours
   - Memberships expiring in 3 days (for both payment and membership notifications)

3. **Frontend Auto-Refresh**: The notification popup automatically refreshes every 60 seconds when open, and the unread count refreshes every 30 seconds.

### Notification Status

- **UNREAD**: New notification, shown with a badge
- **READ**: Notification has been viewed
- **DISMISSED**: Notification has been dismissed (hidden from list)

## Usage

### Viewing Notifications

1. Click the notification bell icon in the header
2. The notification popup will open with three tabs:
   - **Leads**: Lead follow-up reminders
   - **Payments**: Payment due reminders
   - **Members**: Membership expiring and new member notifications

### Interacting with Notifications

- **Click a notification**: Navigate to the related entity (Lead, Member, or Payment)
- **Mark as read**: Clicking a notification automatically marks it as read
- **Dismiss**: Click the X button to dismiss a notification
- **Mark all as read**: Click "Mark all as read" button at the top

### Notification Badges

- Red badge on the bell icon shows the total unread count
- Colored badges on each tab show the unread count for that category

## API Endpoints

### GET /api/notifications/check

Checks for and creates new notifications based on:
- Leads with follow-up dates in the next 2 hours
- Memberships expiring in 3 days

Returns:
```json
{
  "success": true,
  "message": "Notifications checked successfully",
  "counts": {
    "leads": 2,
    "payments": 5,
    "members": 3
  }
}
```

### Server Actions

Located in `lib/actions/notifications.ts`:

- `getNotifications()`: Fetch all notifications grouped by type
- `markNotificationAsRead(id)`: Mark a notification as read
- `dismissNotification(id)`: Dismiss a notification
- `markAllNotificationsAsRead()`: Mark all notifications as read
- `checkAllNotifications()`: Check and create all types of notifications
- `createNewMemberNotification()`: Create notification for a new member

## Troubleshooting

### Prisma Client Errors

If you see errors like `Property 'inAppNotification' does not exist`, it means Prisma Client hasn't been regenerated. Run:

```bash
npx prisma generate
```

### Notifications Not Appearing

1. Make sure the migration has been run
2. Check that the cron job is running (if using automated checks)
3. Verify that there are leads with `followUpDate` set or memberships expiring soon
4. Check the browser console for any errors

### Manual Notification Check

You can manually trigger a notification check by calling:

```bash
curl https://your-domain.com/api/notifications/check
```

Or visit the URL in your browser.

## Database Schema

The `InAppNotification` model includes:

- `id`: Unique identifier
- `type`: One of LEAD_FOLLOW_UP, PAYMENT_DUE, MEMBERSHIP_EXPIRING, NEW_MEMBER
- `title`: Notification title
- `message`: Notification message
- `entityType`: Type of entity (Lead, Member, Payment)
- `entityId`: ID of the related entity
- `status`: UNREAD, READ, or DISMISSED
- `metadata`: JSON data with additional information
- `createdAt`: Timestamp
- `readAt`: Timestamp when marked as read
- `dismissedAt`: Timestamp when dismissed

## Future Enhancements

Potential improvements:
- Email/SMS notifications alongside in-app notifications
- Notification preferences/settings
- Notification filtering and search
- Sound/vibration alerts
- Push notifications (using service workers)
