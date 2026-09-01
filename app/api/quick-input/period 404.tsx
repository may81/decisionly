import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getMonthRange(year: number, month: number) {
  const start = new Date(
    Date.UTC(year, month - 1, 1)
  );

  const end = new Date(
    Date.UTC(year, month, 0)
  );

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const { data: membership, error: membershipError } =
      await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("joined_at", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        {
          error: membershipError.message,
        },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        {
          error: "No active company found.",
        },
        { status: 404 }
      );
    }

    const { data: periods, error } =
      await supabase
        .from("periods")
        .select(
          `
            id,
            company_id,
            period_type,
            period_code,
            period_number,
            start_date,
            end_date,
            status
          `
        )
        .eq(
          "company_id",
          membership.company_id
        )
        .order("start_date", {
          ascending: false,
        })
        .limit(24);

    if (error) {
      console.error(
        "Load periods error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      periods: periods ?? [],
    });
  } catch (error) {
    console.error(
      "GET periods error:",
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const year =
      Number(body.year) ||
      new Date().getFullYear();

    const month =
      Number(body.month) ||
      new Date().getMonth() + 1;

    if (
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 2100
    ) {
      return NextResponse.json(
        {
          error: "Invalid reporting period.",
        },
        { status: 400 }
      );
    }

    const { data: membership, error: membershipError } =
      await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("joined_at", {
          ascending: true,
        })
        .limit(1)
        .maybeSingle();

    if (membershipError) {
      return NextResponse.json(
        {
          error: membershipError.message,
        },
        { status: 500 }
      );
    }

    if (!membership) {
      return NextResponse.json(
        {
          error: "No active company found.",
        },
        { status: 404 }
      );
    }

    const companyId = membership.company_id;

    const periodCode =
      `${year}-${String(month).padStart(2, "0")}`;

    // Jangan membuat duplicate period.
    const { data: existing } =
      await supabase
        .from("periods")
        .select(
          `
            id,
            company_id,
            period_type,
            period_code,
            period_number,
            start_date,
            end_date,
            status
          `
        )
        .eq("company_id", companyId)
        .eq("period_code", periodCode)
        .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: true,
        created: false,
        period: existing,
      });
    }

    const {
      startDate,
      endDate,
    } = getMonthRange(year, month);

    const { data: period, error } =
      await supabase
        .from("periods")
        .insert({
          company_id: companyId,
          period_type: "monthly",
          period_code: periodCode,
          period_number: month,
          start_date: startDate,
          end_date: endDate,
          status: "open",
          is_adjustment_period: false,
        })
        .select(
          `
            id,
            company_id,
            period_type,
            period_code,
            period_number,
            start_date,
            end_date,
            status
          `
        )
        .single();

    if (error) {
      console.error(
        "Create period error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to create reporting period.",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      created: true,
      period,
    });
  } catch (error) {
    console.error(
      "POST period error:",
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