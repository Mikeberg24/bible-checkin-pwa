// app/api/history/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function isAuthorized(code: string | null) {
  const expected = process.env.SHARED_COUPLE_CODE;
  return Boolean(expected && code && code === expected);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const limit = Number(url.searchParams.get("limit") ?? "30");

    if (!isAuthorized(code)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("checkins")
      .select("day, mikey, leelee")
      .order("day", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 365));

    if (error) throw error;

    return NextResponse.json({ rows: data ?? [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
