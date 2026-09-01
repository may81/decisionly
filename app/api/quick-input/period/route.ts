import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const { data: membership, error: membershipError } =
      await supabase
        .from("company_members")
        .select("company_id, role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (membershipError) {
      console.error("Membership error:", membershipError);

      return NextResponse.json(
        {
          error: "Unable to determine your company.",
          details: membershipError.message,
        },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        { error: "No active company found." },
        { status: 404 }
      );
    }

    const { data: periods, error: periodsError } =
      await supabase
        .from("periods")
        .select(
          "id, company_id, period_type, period_code, start_date, end_date, status"
        )
        .eq("company_id", membership.company_id)
        .order("start_date", { ascending: false });

    if (periodsError) {
      console.error("Periods error:", periodsError);

      return NextResponse.json(
        {
          error: "Unable to load reporting periods.",
          details: periodsError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        companyId: membership.company_id,
        periods: periods ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Quick Input period API error:", error);

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