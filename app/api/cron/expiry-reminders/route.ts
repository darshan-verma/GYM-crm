import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { sendMembershipExpiryNotification } from "@/lib/services/notifications";

// This endpoint should be called by a cron job (e.g., daily at 9 AM)
// You can use services like Vercel Cron, GitHub Actions, or cron-job.org
// Example cron expression: 0 9 * * * (every day at 9 AM)

export async function GET(request: Request) {
	try {
		// Verify cron secret for security
		const authHeader = request.headers.get("authorization");
		const cronSecret = process.env.CRON_SECRET || "your-secret-key-here";

		if (authHeader !== `Bearer ${cronSecret}`) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get memberships expiring in the next 7 days
		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const expiringMemberships = await prisma.membership.findMany({
			where: {
				active: true,
				endDate: {
					gte: today,
					lte: sevenDaysFromNow,
				},
			},
			include: {
				member: {
					select: {
						name: true,
						email: true,
						phone: true,
					},
				},
				plan: {
					select: {
						name: true,
					},
				},
			},
		});

		const notifications = [];
		const errors = [];

		// Send notifications
		for (const membership of expiringMemberships) {
			if (!membership.member.email) {
				errors.push({
					memberId: membership.memberId,
					error: "No email address",
				});
				continue;
			}

			try {
				const expiryDate = new Date(membership.endDate).toLocaleDateString(
					"en-IN"
				);

				await sendMembershipExpiryNotification(
					membership.member.email,
					membership.member.phone,
					membership.member.name,
					membership.plan.name,
					expiryDate
				);

				notifications.push({
					memberId: membership.memberId,
					memberName: membership.member.name,
					expiryDate,
				});

				// Log notification in database
				await prisma.notification.create({
					data: {
						type: "EMAIL",
						recipient: membership.member.email,
						subject: "Membership Expiring Soon",
						message: `Your ${membership.plan.name} membership expires on ${expiryDate}`,
						status: "SENT",
						sentAt: new Date(),
					},
				});
			} catch (error) {
				console.error(
					`Failed to send notification for member ${membership.memberId}:`,
					error
				);
				errors.push({
					memberId: membership.memberId,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: "Membership expiry reminders processed",
			stats: {
				totalExpiring: expiringMemberships.length,
				notificationsSent: notifications.length,
				errors: errors.length,
			},
			notifications,
			errors,
		});
	} catch (error) {
		console.error("Cron job error:", error);
		return NextResponse.json(
			{
				error: "Failed to process membership expiry reminders",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// POST endpoint for manual trigger (for testing)
export async function POST(_request: Request) {
	// Same logic as GET, but without auth requirement for admin testing
	try {
		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const expiringMemberships = await prisma.membership.findMany({
			where: {
				active: true,
				endDate: {
					gte: today,
					lte: sevenDaysFromNow,
				},
			},
			include: {
				member: {
					select: {
						name: true,
						email: true,
						phone: true,
					},
				},
				plan: {
					select: {
						name: true,
					},
				},
			},
		});

		return NextResponse.json({
			success: true,
			message: "Manual trigger - preview mode",
			stats: {
				totalExpiring: expiringMemberships.length,
			},
			memberships: expiringMemberships.map((m) => ({
				memberName: m.member.name,
				planName: m.plan.name,
				expiryDate: new Date(m.endDate).toLocaleDateString("en-IN"),
				daysRemaining: Math.ceil(
					(new Date(m.endDate).getTime() - today.getTime()) /
						(1000 * 60 * 60 * 24)
				),
			})),
		});
	} catch (error) {
		console.error("Manual trigger error:", error);
		return NextResponse.json(
			{ error: "Failed to preview expiring memberships" },
			{ status: 500 }
		);
	}
}
