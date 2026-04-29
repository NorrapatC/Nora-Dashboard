import { NextRequest, NextResponse } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

function resetRateLimit(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "พยายามเข้าสู่ระบบบ่อยเกินไปค่ะ กรุณารอ 15 นาทีแล้วลองใหม่" },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  const { password } = await req.json();
  const correct = process.env.DASHBOARD_PASSWORD;
  const secret  = process.env.DASHBOARD_SESSION_SECRET;

  if (!correct || !secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (password !== correct) {
    return NextResponse.json(
      { error: `รหัสผ่านไม่ถูกต้อง (เหลือ ${remaining} ครั้ง)` },
      { status: 401 }
    );
  }

  resetRateLimit(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("nora_session", secret, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
