"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/exercises";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

function CompleteContent() {
  const searchParams = useSearchParams();
  const time = parseInt(searchParams.get("time") || "0");
  const exerciseType = searchParams.get("type") || "";
  const score = parseInt(searchParams.get("score") || "10");
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    const playerName = getCookie("playerName");
    if (playerName && exerciseType && time > 0) {
      savedRef.current = true;

      // Get exercise data from sessionStorage
      const exerciseDataStr = sessionStorage.getItem("exerciseData");
      let exercises, wrongAnswers;
      if (exerciseDataStr) {
        const data = JSON.parse(exerciseDataStr);
        exercises = data.exercises;
        wrongAnswers = data.wrongAnswers;
        sessionStorage.removeItem("exerciseData");
      }

      fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          exerciseType,
          timeMs: time,
          score,
          exercises,
          wrongAnswers,
        }),
      }).catch(console.error);
    }
  }, [time, exerciseType, score]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6">
        <Label className="text-4xl font-bold">Goed gedaan!</Label>
        <div className="text-center space-y-2">
          <p className="text-xl text-muted-foreground">{score}/10 correct</p>
          <p className="text-lg text-muted-foreground">
            Tijd: {formatTime(time)}
          </p>
        </div>
        <Button asChild className="text-xl h-12 px-6">
          <Link href="/">Opnieuw</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={null}>
      <CompleteContent />
    </Suspense>
  );
}
