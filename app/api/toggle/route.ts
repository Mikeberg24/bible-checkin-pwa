// app/api/toggle/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Person = "mikey" | "leelee";

function isAuthorized(code: string | null) {
  const expected = process.env.SHARED_COUPLE_CODE;
  return Boolean(expected && code && code === expected);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const day: string | undefined = body?.day;
    const person: Person | undefined = body?.person;
    const code: string | undefined = body?.code;

    if (!isAuthorized(code ?? null)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!day) return NextResponse.json({ error: "Missing day" }, { status: 400 });
    if (person !== "mikey" && person !== "leelee") {
      return NextResponse.json({ error: "Invalid person" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Get current row (or defaults)
    const { data: current, error: readErr } = await supabase
      .from("checkins")
      .select("mikey, leelee")
      .eq("day", day)
      .maybeSingle();

    if (readErr) throw readErr;

    const next = {
      day,
      mikey: current?.mikey ?? false,
      leelee: current?.leelee ?? false,
      [person]: !(current?.[person] ?? false),
    };

    // Upsert row for the day
    const { data: saved, error: upsertErr } = await supabase
      .from("checkins")
      .upsert(next, { onConflict: "day" })
      .select("day, mikey, leelee")
      .single();

    if (upsertErr) throw upsertErr;

    return NextResponse.json(saved);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
