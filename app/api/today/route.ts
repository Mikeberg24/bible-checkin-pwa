// app/api/today/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function isAuthorized(code: string | null) {
  const expected = process.env.SHARED_COUPLE_CODE;
  return Boolean(expected && code && code === expected);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const day = url.searchParams.get("day"); // YYYY-MM-DD
    const code = url.searchParams.get("code");

    if (!isAuthorized(code)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!day) {
      return NextResponse.json({ error: "Missing day" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("checkins")
      .select("mikey, leelee")
      .eq("day", day)
      .maybeSingle();

    if (error) throw error;

    // Default to false/false if no row exists yet
    return NextResponse.json({
      day,
      mikey: data?.mikey ?? false,
      leelee: data?.leelee ?? false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
