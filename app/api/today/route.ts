import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const day = searchParams.get("day");
  const code = searchParams.get("code");

  if (code !== process.env.SHARED_COUPLE_CODE) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  return NextResponse.json({
    day,
    mikey: false,
    leelee: false,
  });
}
