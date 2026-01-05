import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

type ToggleBody = {
  code: string;
  day: string; // YYYY-MM-DD
  who: "mike" | "gf";
  value: boolean;
};

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ToggleBody>;

  if (!body.code || body.code !== process.env.SHARED_COUPLE_CODE) return bad("Wrong code", 401);
  if (!body.day) return bad("Missing day");
  if (body.who !== "mike" && body.who !== "gf") return bad("Invalid who");
  if (typeof body.value !== "boolean") return bad("Invalid value");

  const column = body.who === "mike" ? "mike_done" : "gf_done";

  const sb = supabaseServer();

  // Upsert row for that day (creates it if missing)
  const { error } = await sb
    .from("daily_reading")
    .upsert(
      { day: body.day, [column]: body.value },
      { onConflict: "day" }
    );

  if (error) return bad(error.message, 500);

  // Return the updated row
  const { data, error: readErr } = await sb
    .from("daily_reading")
    .select("day, mike_done, gf_done, updated_at")
    .eq("day", body.day)
    .maybeSingle();

  if (readErr) return bad(readErr.message, 500);

  return NextResponse.json(data ?? { ok: true });
}
