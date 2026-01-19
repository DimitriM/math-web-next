import { NextRequest, NextResponse } from "next/server";
import { getExerciseAttempts } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resultId = parseInt(id);
    if (isNaN(resultId)) {
      return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
    }
    const attempts = getExerciseAttempts(resultId);
    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Failed to get attempts:", error);
    return NextResponse.json(
      { error: "Failed to get attempts" },
      { status: 500 }
    );
  }
}
