"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  generateExercises,
  SPLIT_OPERATOR,
  type Exercise,
  type ExerciseType,
} from "@/lib/exercises";

function ExerciseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") as ExerciseType;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<Map<number, number>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const wrongTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const validTypes = [
    "addition-10",
    "subtraction-10",
    "addition-20",
    "subtraction-20",
    "addition-100-easy",
    "subtraction-100-easy",
    "addition-100",
    "subtraction-100",
    "splitting",
    ...Array.from({ length: 10 }, (_, i) => `multiplication-${i + 1}`),
    ...Array.from({ length: 10 }, (_, i) => `division-${i + 1}`),
  ];

  useEffect(() => {
    if (!type || !validTypes.includes(type)) {
      router.push("/");
      return;
    }
    setExercises(generateExercises(type));
    setStartTime(Date.now());
  }, [type, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [exercises]);

  const currentExercise = exercises[currentIndex];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showCorrect || showWrong || !currentExercise) return;

    const newValue = e.target.value;
    setValue(newValue);

    // Clear any existing wrong answer timeout
    if (wrongTimeoutRef.current) {
      clearTimeout(wrongTimeoutRef.current);
      wrongTimeoutRef.current = null;
    }

    if (parseInt(newValue) === currentExercise.answer) {
      setShowCorrect(true);
      setTimeout(() => {
        setValue("");
        setShowCorrect(false);
        const nextIndex = currentIndex + 1;
        if (nextIndex >= 10) {
          const totalTime = Date.now() - startTime;
          const score = Math.max(0, 10 - wrongAnswers.size);
          // Store exercise data in sessionStorage for the complete page
          sessionStorage.setItem(
            "exerciseData",
            JSON.stringify({
              exercises,
              wrongAnswers: Object.fromEntries(wrongAnswers),
            })
          );
          router.push(`/complete?time=${totalTime}&type=${type}&score=${score}`);
        } else {
          setCurrentIndex(nextIndex);
        }
      }, 400);
    } else if (newValue.length > 0) {
      // Start a timeout to show wrong animation after 2 seconds
      wrongTimeoutRef.current = setTimeout(() => {
        if (parseInt(newValue) !== currentExercise.answer) {
          // Only store the first wrong answer for this exercise
          if (!wrongAnswers.has(currentIndex)) {
            setWrongAnswers((prev) => new Map(prev).set(currentIndex, parseInt(newValue)));
          }
          setShowWrong(true);
          setTimeout(() => {
            setValue("");
            setShowWrong(false);
            inputRef.current?.focus();
          }, 400);
        }
      }, 2000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (wrongTimeoutRef.current) {
        clearTimeout(wrongTimeoutRef.current);
      }
    };
  }, []);

  if (!currentExercise) {
    return null;
  }

  if (currentExercise.operator === SPLIT_OPERATOR) {
    const boxClass =
      "w-16 h-16 flex items-center justify-center rounded-md border-2 text-3xl font-bold transition-all duration-300";
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center w-full max-w-xs">
          <Label className="text-sm text-muted-foreground mb-4">
            {currentIndex + 1} / 10
          </Label>
          <div
            className={`${boxClass} border-foreground ${
              showCorrect ? "scale-110 border-green-500 text-green-500" : ""
            } ${showWrong ? "scale-110 border-red-500 text-red-500" : ""}`}
          >
            {currentExercise.a}
          </div>
          <svg
            width="192"
            height="40"
            viewBox="0 0 192 40"
            className="text-muted-foreground"
            aria-hidden="true"
          >
            <line x1="96" y1="0" x2="32" y2="40" stroke="currentColor" strokeWidth="2" />
            <line x1="96" y1="0" x2="160" y2="40" stroke="currentColor" strokeWidth="2" />
          </svg>
          <div className="flex justify-between w-48">
            <div className={`${boxClass} border-foreground`}>
              {currentExercise.b}
            </div>
            <Input
              ref={inputRef}
              type="number"
              className={`w-16 h-16 px-1 text-center text-3xl md:text-3xl font-bold border-2 border-foreground transition-all duration-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                showCorrect ? "border-green-500 bg-green-50" : ""
              } ${showWrong ? "border-red-500 bg-red-50" : ""}`}
              value={value}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <Label className="text-sm text-muted-foreground">
          {currentIndex + 1} / 10
        </Label>
        <Label
          className={`text-4xl font-bold transition-all duration-300 ${
            showCorrect ? "scale-110 text-green-500" : ""
          } ${showWrong ? "scale-110 text-red-500" : ""}`}
        >
          {currentExercise.a} {currentExercise.operator} {currentExercise.b} = ?
        </Label>
        <Input
          ref={inputRef}
          type="number"
          placeholder="Uitkomst"
          className={`text-center text-2xl h-14 transition-all duration-300 ${
            showCorrect ? "border-green-500 bg-green-50" : ""
          } ${showWrong ? "border-red-500 bg-red-50" : ""}`}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default function ExercisePage() {
  return (
    <Suspense fallback={null}>
      <ExerciseContent />
    </Suspense>
  );
}
