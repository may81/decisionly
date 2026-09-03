
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createClient();

    /*
     * ---------------------------------------------------------
     * 1. AUTHENTICATED USER
     * ---------------------------------------------------------
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[Billing] Auth error:", userError);

      return NextResponse.json(
        {
          error: userError.message || "Authentication error.",
        },
        { status: 401 }
      );
    }

    if (!user) {
      console.error("[Billing] No authenticated user.");

      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    console.log("[Billing] Authenticated user:", user.id);

    /*
     * ---------------------------------------------------------
     * 2. ACTIVE COMPANY MEMBERSHIP
     * ---------------------------------------------------------
     */

    const {
  data: membership,
  error: membershipError,
} = await supabase
  .from("company_members")
  .select("company_id, role, status")
  .eq("user_id", user.id)
  .eq("status", "active")
  .limit(1)
  .maybeSingle();

    if (membershipError) {
      console.error(
        "[Billing] Membership error:",
        membershipError
      );

      return NextResponse.json(
        {
          error:
            membershipError.message ||
            "Unable to determine active company.",
          code: membershipError.code ?? null,
          details: membershipError.details ?? null,
          hint: membershipError.hint ?? null,
        },
        { status: 500 }
      );
    }

    if (!membership?.company_id) {
      console.error(
        "[Billing] No active company for user:",
        user.id
      );

      return NextResponse.json(
        {
          error:
            "No active company found. Please complete company setup first.",
        },
        { status: 400 }
      );
    }

    const companyId = membership.company_id;

    console.log("[Billing] Active company:", {
      companyId,
      role: membership.role,
    });

    /*
     * ---------------------------------------------------------
     * 3. SUBSCRIPTION
     * ---------------------------------------------------------
     */

    const {
      data: subscription,
      error: subscriptionError,
    } = await supabase
      .from("subscriptions")
      .select(`
        id,
        company_id,
        plan,
        status,
        paddle_customer_id,
        paddle_subscription_id,
        paddle_price_id,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at
      `)
      .eq("company_id", companyId)
      .maybeSingle();

    if (subscriptionError) {
      console.error(
        "[Billing] Subscription error:",
        subscriptionError
      );

      return NextResponse.json(
        {
          error:
            subscriptionError.message ||
            "Unable to load subscription.",
          code: subscriptionError.code ?? null,
          details: subscriptionError.details ?? null,
          hint: subscriptionError.hint ?? null,
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. RESPONSE
     * ---------------------------------------------------------
     */

    return NextResponse.json({
      success: true,
      userId: user.id,
      companyId,
      role: membership.role,

      subscription:
        subscription ?? {
          plan: "free",
          status: "active",
          cancel_at_period_end: false,
          current_period_start: null,
          current_period_end: null,
          paddle_customer_id: null,
          paddle_subscription_id: null,
          paddle_price_id: null,
        },
    });
  } catch (error) {
    console.error(
      "[Billing] Unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}

