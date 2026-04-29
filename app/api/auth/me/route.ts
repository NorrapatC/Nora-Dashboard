import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("nora_session")?.value;
  const secret  = process.env.DASHBOARD_SESSION_SECRET;
  const authenticated = !!(session && secret && session === secret);
  return NextResponse.json({ authenticated });
}
