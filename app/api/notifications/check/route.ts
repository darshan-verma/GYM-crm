import { NextResponse } from "next/server";
import { checkAllNotifications } from "@/lib/actions/notifications";

// This endpoint can be called periodically to check and create notifications
// Can be used with a cron job or called from the frontend
export async function GET(_request: Request) {
  try {
    // Optional: Add authentication/authorization check here
    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const result = await checkAllNotifications();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Notifications checked successfully",
        counts: {
          leads: result.leads,
          payments: result.payments,
          members: result.members,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to check notifications",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Check notifications API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual trigger (with authentication)
export async function POST(_request: Request) {
  try {
    // Optional: Add authentication/authorization check here
    // const session = await auth();
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const result = await checkAllNotifications();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Notifications checked successfully",
        counts: {
          leads: result.leads,
          payments: result.payments,
          members: result.members,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to check notifications",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Check notifications API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check notifications",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
