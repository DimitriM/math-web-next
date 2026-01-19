import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "mathweb.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    exercise_type TEXT NOT NULL,
    time_ms INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 10,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS exercise_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_id INTEGER NOT NULL,
    exercise_index INTEGER NOT NULL,
    a INTEGER NOT NULL,
    b INTEGER NOT NULL,
    answer INTEGER NOT NULL,
    operator TEXT NOT NULL,
    was_wrong INTEGER NOT NULL DEFAULT 0,
    user_answer INTEGER,
    FOREIGN KEY (result_id) REFERENCES results(id)
  )
`);

// Add user_answer column if it doesn't exist (migration for existing databases)
try {
  db.exec(`ALTER TABLE exercise_attempts ADD COLUMN user_answer INTEGER`);
} catch {
  // Column already exists, ignore error
}

export interface ExerciseAttempt {
  id: number;
  result_id: number;
  exercise_index: number;
  a: number;
  b: number;
  answer: number;
  operator: string;
  was_wrong: boolean;
  user_answer: number | null;
}

export interface Result {
  id: number;
  player_name: string;
  exercise_type: string;
  time_ms: number;
  score: number;
  created_at: string;
}

export interface ResultWithAttempts extends Result {
  attempts: ExerciseAttempt[];
}

export function saveResult(
  playerName: string,
  exerciseType: string,
  timeMs: number,
  score: number = 10,
  exercises?: { a: number; b: number; answer: number; operator: string }[],
  wrongAnswers?: Record<number, number>
): Result {
  const stmt = db.prepare(`
    INSERT INTO results (player_name, exercise_type, time_ms, score)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(playerName, exerciseType, timeMs, score);
  const resultId = info.lastInsertRowid as number;

  // Save exercise attempts if provided
  if (exercises && exercises.length > 0) {
    const attemptStmt = db.prepare(`
      INSERT INTO exercise_attempts (result_id, exercise_index, a, b, answer, operator, was_wrong, user_answer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    exercises.forEach((ex, index) => {
      const userAnswer = wrongAnswers?.[index];
      const wasWrong = userAnswer !== undefined;
      attemptStmt.run(resultId, index, ex.a, ex.b, ex.answer, ex.operator, wasWrong ? 1 : 0, userAnswer ?? null);
    });
  }

  return {
    id: resultId,
    player_name: playerName,
    exercise_type: exerciseType,
    time_ms: timeMs,
    score,
    created_at: new Date().toISOString(),
  };
}

export function getResultsByPlayer(playerName: string): Result[] {
  const stmt = db.prepare(`
    SELECT * FROM results
    WHERE player_name = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(playerName) as Result[];
}

export function getAllResults(): Result[] {
  const stmt = db.prepare(`
    SELECT * FROM results
    ORDER BY created_at DESC
  `);
  return stmt.all() as Result[];
}

export function getExerciseAttempts(resultId: number): ExerciseAttempt[] {
  const stmt = db.prepare(`
    SELECT * FROM exercise_attempts
    WHERE result_id = ?
    ORDER BY exercise_index ASC
  `);
  const rows = stmt.all(resultId) as (Omit<ExerciseAttempt, "was_wrong"> & { was_wrong: number })[];
  return rows.map((row) => ({
    ...row,
    was_wrong: row.was_wrong === 1,
  }));
}

export default db;
