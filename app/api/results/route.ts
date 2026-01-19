import { NextRequest, NextResponse } from "next/server";
import { saveResult, getAllResults } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, exerciseType, timeMs, score = 10, exercises, wrongAnswers } = body;

    if (!playerName || !exerciseType || typeof timeMs !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = saveResult(playerName, exerciseType, timeMs, score, exercises, wrongAnswers);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to save result:", error);
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const results = getAllResults();
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to get results:", error);
    return NextResponse.json(
      { error: "Failed to get results" },
      { status: 500 }
    );
  }
}
