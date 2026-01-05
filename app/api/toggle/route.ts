import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { person, code } = body;

  if (code !== process.env.SHARED_COUPLE_CODE) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    person,
  });
}
