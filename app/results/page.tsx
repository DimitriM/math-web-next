"use client";

import { useEffect, useState } from "react";
import {
  formatTime,
  getExerciseLabel,
  type ExerciseType,
} from "@/lib/exercises";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Result, ExerciseAttempt } from "@/lib/db";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    fetch("/api/results")
      .then((res) => res.json())
      .then(setResults)
      .catch(console.error);
  }, []);

  const handleRowClick = async (resultId: number) => {
    if (expandedId === resultId) {
      setExpandedId(null);
      setAttempts([]);
      return;
    }

    setExpandedId(resultId);
    setLoadingAttempts(true);
    try {
      const res = await fetch(`/api/results/${resultId}/attempts`);
      const data = await res.json();
      setAttempts(data);
    } catch (error) {
      console.error("Failed to load attempts:", error);
      setAttempts([]);
    }
    setLoadingAttempts(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Resultaten</h1>
          <Button asChild variant="outline">
            <Link href="/">Terug</Link>
          </Button>
        </div>

        {results.length === 0 ? (
          <p className="text-muted-foreground">Nog geen resultaten.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Naam</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Score</th>
                  <th className="text-left p-3 font-medium">Tijd</th>
                  <th className="text-left p-3 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <>
                    <tr
                      key={result.id}
                      className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(result.id)}
                    >
                      <td className="p-3">{result.player_name}</td>
                      <td className="p-3">
                        {getExerciseLabel(result.exercise_type as ExerciseType)}
                      </td>
                      <td className="p-3">{result.score}/10</td>
                      <td className="p-3">{formatTime(result.time_ms)}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(result.created_at).toLocaleDateString(
                          "nl-NL",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                    </tr>
                    {expandedId === result.id && (
                      <tr key={`${result.id}-expanded`}>
                        <td colSpan={5} className="p-0">
                          <div className="bg-muted/30 p-4">
                            {loadingAttempts ? (
                              <p className="text-muted-foreground">Laden...</p>
                            ) : attempts.length === 0 ? (
                              <p className="text-muted-foreground">
                                Geen oefeningen opgeslagen voor dit resultaat.
                              </p>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {attempts.map((attempt) => {
                                  const showAsWrong = attempt.was_wrong && attempt.user_answer !== null;
                                  return (
                                    <div
                                      key={attempt.id}
                                      className={`p-2 rounded text-center ${
                                        showAsWrong
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {attempt.a} {attempt.operator} {attempt.b} ={" "}
                                      {showAsWrong ? (
                                        <>
                                          <span className="line-through">{attempt.user_answer}</span>
                                          <span className="text-green-600 ml-1">({attempt.answer})</span>
                                        </>
                                      ) : (
                                        attempt.answer
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
