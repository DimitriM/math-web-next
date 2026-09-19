export type ExerciseType =
  | "addition-10"
  | "subtraction-10"
  | "addition-20"
  | "subtraction-20"
  | "addition-100-easy"
  | "subtraction-100-easy"
  | "addition-100"
  | "subtraction-100"
  | "splitting"
  | "multiplication-1"
  | "multiplication-2"
  | "multiplication-3"
  | "multiplication-4"
  | "multiplication-5"
  | "multiplication-6"
  | "multiplication-7"
  | "multiplication-8"
  | "multiplication-9"
  | "multiplication-10"
  | "division-1"
  | "division-2"
  | "division-3"
  | "division-4"
  | "division-5"
  | "division-6"
  | "division-7"
  | "division-8"
  | "division-9"
  | "division-10";

export interface Exercise {
  a: number;
  b: number;
  answer: number;
  operator: string;
}

// Operator used for "splitsingen": a is the total, b is the given part, answer is the other part
export const SPLIT_OPERATOR = "split";

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateExercises(type: ExerciseType): Exercise[] {
  const exercises: Exercise[] = [];

  if (type.startsWith("multiplication-")) {
    // Get the table number (1-10)
    const tableNum = parseInt(type.split("-")[1]);
    // Generate all 10 exercises (1×n through 10×n) and shuffle
    for (let a = 1; a <= 10; a++) {
      exercises.push({
        a,
        b: tableNum,
        answer: a * tableNum,
        operator: "×",
      });
    }
    return shuffle(exercises);
  }

  if (type.startsWith("division-")) {
    // Get the table number (1-10)
    const tableNum = parseInt(type.split("-")[1]);
    // Generate all 10 exercises (n÷n through 10n÷n) and shuffle
    for (let answer = 1; answer <= 10; answer++) {
      exercises.push({
        a: answer * tableNum,
        b: tableNum,
        answer,
        operator: "÷",
      });
    }
    return shuffle(exercises);
  }

  while (exercises.length < 10) {
    if (type === "splitting") {
      // Splitsingen: total is 1-10, given part is 0 to total-1, answer is the other part
      const a = Math.floor(Math.random() * 10) + 1; // 1-10
      const b = Math.floor(Math.random() * a); // 0 to a-1
      exercises.push({ a, b, answer: a - b, operator: SPLIT_OPERATOR });
    } else if (type === "addition-100-easy") {
      // Easy addition 0-100: one number is small (1-9), stays in same dozen or goes to next round dozen
      // Examples: 80+5, 30+60, 50+7, 38+2, 4+54, 66+20, 10+73
      const patterns = [
        // Pattern 1: round dozen + small number (80+5)
        () => {
          const dozen = Math.floor(Math.random() * 10) * 10; // 0, 10, 20, ..., 90
          const small = Math.floor(Math.random() * 9) + 1; // 1-9
          return { a: dozen, b: small };
        },
        // Pattern 2: round dozen + round dozen (30+60)
        () => {
          const dozen1 = Math.floor(Math.random() * 10) * 10;
          const dozen2 = Math.floor(Math.random() * (10 - dozen1 / 10) + 1) * 10; // ensure sum <= 100
          return { a: dozen1, b: dozen2 };
        },
        // Pattern 3: number ending in 8/9 + small to make round dozen (38+2)
        () => {
          const dozen = Math.floor(Math.random() * 9) + 1; // 1-9 (target dozen)
          const remainder = Math.floor(Math.random() * 3) + 7; // 7, 8, or 9
          const a = (dozen - 1) * 10 + remainder;
          const b = 10 - remainder;
          return { a, b };
        },
        // Pattern 4: small number + larger number (4+54)
        () => {
          const small = Math.floor(Math.random() * 9) + 1; // 1-9
          const dozen = Math.floor(Math.random() * 9) + 1; // 1-9
          const units = Math.floor(Math.random() * (10 - small)); // ensure no carry
          const large = dozen * 10 + units;
          return { a: small, b: large };
        },
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const { a, b } = pattern();
      const answer = a + b;
      if (answer <= 100) {
        exercises.push({ a, b, answer, operator: "+" });
      }
    } else if (type === "subtraction-100-easy") {
      // Easy subtraction 0-100: stay in same dozen or subtract round dozens
      // Examples: 90-40, 100-90, 100-30, 58-20, 48-5, 70-6, 50-1
      const patterns = [
        // Pattern 1: round dozen - round dozen (90-40)
        () => {
          const dozen1 = (Math.floor(Math.random() * 9) + 1) * 10; // 10-90
          const dozen2 = Math.floor(Math.random() * (dozen1 / 10)) * 10; // 0 to dozen1
          return { a: dozen1, b: dozen2 };
        },
        // Pattern 2: 100 - round dozen (100-30)
        () => {
          const dozen = Math.floor(Math.random() * 10) * 10; // 0-90
          return { a: 100, b: dozen };
        },
        // Pattern 3: number - round dozen, same dozen result (58-20)
        () => {
          const a = Math.floor(Math.random() * 80) + 20; // 20-99
          const subtractDozens = Math.floor(Math.random() * Math.floor(a / 10)) + 1;
          const b = subtractDozens * 10;
          return { a, b };
        },
        // Pattern 4: number - small, stay in same dozen (48-5)
        () => {
          const dozen = Math.floor(Math.random() * 9) + 1; // 1-9
          const units = Math.floor(Math.random() * 9) + 1; // 1-9
          const a = dozen * 10 + units;
          const b = Math.floor(Math.random() * units) + 1; // 1 to units (no borrow)
          return { a, b };
        },
        // Pattern 5: round dozen - small (70-6)
        () => {
          const dozen = (Math.floor(Math.random() * 9) + 1) * 10; // 10-90
          const small = Math.floor(Math.random() * 9) + 1; // 1-9
          return { a: dozen, b: small };
        },
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const { a, b } = pattern();
      const answer = a - b;
      if (answer >= 0) {
        exercises.push({ a, b, answer, operator: "−" });
      }
    } else if (type === "addition-100") {
      // Difficult addition: random numbers, result 0-100
      const answer = Math.floor(Math.random() * 101); // 0-100
      const a = Math.floor(Math.random() * (answer + 1));
      const b = answer - a;
      exercises.push({ a, b, answer, operator: "+" });
    } else if (type === "subtraction-100") {
      // Difficult subtraction: random numbers, result 0-100
      const a = Math.floor(Math.random() * 101); // 0-100
      const b = Math.floor(Math.random() * (a + 1)); // 0 to a
      const answer = a - b;
      exercises.push({ a, b, answer, operator: "−" });
    } else if (type.startsWith("addition")) {
      // addition-20: answer is 11-20, addition-10: answer is 1-10
      const minAnswer = type === "addition-20" ? 10 : 1;
      const answer = Math.floor(Math.random() * 10) + minAnswer;
      const a = Math.floor(Math.random() * (answer + 1));
      const b = answer - a;
      exercises.push({ a, b, answer, operator: "+" });
    } else if (type.startsWith("subtraction")) {
      // subtraction-20: a is 11-20, subtraction-10: a is 1-10
      const minA = type === "subtraction-20" ? 10 : 1;
      const a = Math.floor(Math.random() * 10) + minA;
      const b = Math.floor(Math.random() * (a + 1)); // 0 to a
      const answer = a - b;
      exercises.push({ a, b, answer, operator: "−" });
    }
  }
  return exercises;
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${remainingSeconds}s`;
}

export function getExerciseLabel(type: ExerciseType): string {
  if (type.startsWith("multiplication-")) {
    const tableNum = type.split("-")[1];
    return `Tafel van ${tableNum}`;
  }
  if (type.startsWith("division-")) {
    const tableNum = type.split("-")[1];
    return `Deeltafel van ${tableNum}`;
  }
  switch (type) {
    case "addition-10":
      return "Optellen (0-10)";
    case "subtraction-10":
      return "Aftrekken (0-10)";
    case "addition-20":
      return "Optellen (0-20)";
    case "subtraction-20":
      return "Aftrekken (0-20)";
    case "addition-100-easy":
      return "Optellen (0-100 makkelijk)";
    case "subtraction-100-easy":
      return "Aftrekken (0-100 makkelijk)";
    case "addition-100":
      return "Optellen (0-100 moeilijk)";
    case "subtraction-100":
      return "Aftrekken (0-100 moeilijk)";
    case "splitting":
      return "Splitsingen (1-10)";
    default:
      return type;
  }
}
