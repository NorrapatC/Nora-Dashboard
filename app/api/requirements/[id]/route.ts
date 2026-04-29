import { NextRequest, NextResponse } from "next/server";
import { updateRequirement, archiveRequirement } from "@/lib/notion";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    await updateRequirement(id, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[PATCH /api/requirements/:id]", e);
    return NextResponse.json({ error: "Failed to update requirement" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await archiveRequirement(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/requirements/:id]", e);
    return NextResponse.json({ error: "Failed to delete requirement" }, { status: 500 });
  }
}
