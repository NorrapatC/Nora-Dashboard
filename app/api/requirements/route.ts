import { NextRequest, NextResponse } from "next/server";
import { getRequirements, createRequirement } from "@/lib/notion";

export async function GET(req: NextRequest) {
  try {
    const project = req.nextUrl.searchParams.get("project") ?? undefined;
    const reqs = await getRequirements(project);
    return NextResponse.json(reqs);
  } catch (e) {
    console.error("[GET /api/requirements]", e);
    return NextResponse.json({ error: "Failed to fetch requirements" }, { status: 500 });
  }
}

const VALID_PRIORITIES = ["High", "Medium", "Low"];
const VALID_SIZES = ["S", "M", "L", "XL"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (body.title.length > 200) {
      return NextResponse.json({ error: "Title too long (max 200 chars)" }, { status: 400 });
    }
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    if (body.size && !VALID_SIZES.includes(body.size)) {
      return NextResponse.json({ error: "Invalid size" }, { status: 400 });
    }
    const created = await createRequirement({
      title:       String(body.title).trim().slice(0, 200),
      description: String(body.description ?? "").slice(0, 2000),
      priority:    VALID_PRIORITIES.includes(body.priority) ? body.priority : "Medium",
      assignedTo:  String(body.assignedTo ?? "Nora").slice(0, 50),
      size:        VALID_SIZES.includes(body.size) ? body.size : "M",
      project:     String(body.project ?? "").slice(0, 100),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("[POST /api/requirements]", e);
    return NextResponse.json({ error: "Failed to create requirement" }, { status: 500 });
  }
}
