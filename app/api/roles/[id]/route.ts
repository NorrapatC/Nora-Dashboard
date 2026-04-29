import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const ROLE_MAP: Record<string, string> = {
  nora: "nora",
  aria: "tech_lead",
  nova: "ui_ux_designer",
  sage: "database_engineer",
  mia:  "frontend_developer",
  luna: "backend_developer",
  vera: "security_engineer",
  iris: "code_reviewer",
  zoe:  "qa_engineer",
  rex:  "devops_engineer",
  lyra: "technical_writer",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roleFile = ROLE_MAP[id.toLowerCase()];
  if (!roleFile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const filePath = path.join(process.cwd(), "..", "NRP", "roles", `${roleFile}.md`);
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
