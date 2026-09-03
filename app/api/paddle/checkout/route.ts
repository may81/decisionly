import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PRICE_TO_PLAN: Record<string, "pro" | "business"> = {
  "pri_01m0784wpq5xjxyjg1a8f1kk3m": "pro",
  "pri_01m078kjpwsq7pgxbxvsq362qm": "business",
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const priceId =
      typeof body?.priceId === "string"
        ? body.priceId
        : "";

    if (!priceId) {
      return NextResponse.json(
        {
          error: "Price ID is required.",
        },
        { status: 400 }
      );
    }

    const plan = PRICE_TO_PLAN[priceId];

    if (!plan) {
      return NextResponse.json(
        {
          error: "Invalid Paddle price.",
        },
        { status: 400 }
      );
    }

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("company_members")
      .select(
        `
          company_id,
          role,
          status
        `
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "[Paddle Checkout] Membership error:",
        membershipError
      );

      return NextResponse.json(
        {
          error: "Unable to determine active company.",
        },
        { status: 500 }
      );
    }

    if (!membership?.company_id) {
      return NextResponse.json(
        {
          error:
            "No active company found. Please complete company setup first.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      companyId: membership.company_id,
      plan,
      priceId,
    });
  } catch (error) {
    console.error(
      "[Paddle Checkout] Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to prepare Paddle checkout.",
      },
      { status: 500 }
    );
  }
}