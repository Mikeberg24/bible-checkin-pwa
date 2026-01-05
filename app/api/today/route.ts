import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code") ?? "";
  const day = searchParams.get("day") ?? ""; // YYYY-MM-DD

  if (!code || code !== process.env.SHARED_COUPLE_CODE) return bad("Wrong code", 401);
  if (!day) return bad("Missing day");

  const sb = supabaseServer();

  const { data, error } = await sb
    .from("daily_reading")
    .select("day, mike_done, gf_done, updated_at")
    .eq("day", day)
    .maybeSingle();

  if (error) return bad(error.message, 500);

  // If no row exists yet for that day, return defaults
  if (!data) {
    return NextResponse.json({
      day,
      mike_done: false,
      gf_done: false,
      updated_at: null,
    });
  }

  return NextResponse.json(data);
}
