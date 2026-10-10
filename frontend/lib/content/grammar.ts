import { readFileSync } from "node:fs";
import path from "node:path";
import { getAvailableLessons } from "./lesson";

export type GrammarBreakdownPart = {
  part: string;
  role: string;
};

export type GrammarExample = {
  korean: string;
  translation: string;
  notes: string;
  highlight?: string;
  breakdown?: GrammarBreakdownPart[];
};

export type GrammarConjugationExample = {
  stem: string;
  affix: string;
  result: string;
  meaning?: string;
};

export type GrammarConjugationRule = {
  condition: string;
  patchimBadge?: "has_patchim" | "no_patchim" | "any";
  formula: string;
  examples: GrammarConjugationExample[];
};

export type GrammarEntry = {
  id: string;
  lessonId: string;
  lessonTitle?: string;
  category?: string;
  title: string;
  pattern: string;
  meaning: string;
  explanation: string;
  structure: string;
  rules?: GrammarConjugationRule[];
  examples: GrammarExample[];
  notes: string;
};

export function getGrammarByLesson(lessonSlug: string): GrammarEntry[] {
  const filePath = path.join(
    process.cwd(),
    "..",
    "data",
    "korean",
    "courses",
    "tong-hop",
    "books",
    "book-01",
    "lessons",
    lessonSlug,
    "grammar.json",
  );

  try {
    const fileContents = readFileSync(filePath, "utf8");
    return JSON.parse(fileContents) as GrammarEntry[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Grammar file not found for lesson "${lessonSlug}": ${filePath}`);
    }

    throw new Error(`Unable to load grammar for lesson "${lessonSlug}": ${filePath}`);
  }
}

export function getAllGrammar(courseId = "tong-hop", bookId = "book-01"): GrammarEntry[] {
  const lessons = getAvailableLessons(courseId, bookId).filter((l) => l.hasContent);
  const allGrammar: GrammarEntry[] = [];

  for (const lesson of lessons) {
    try {
      const items = getGrammarByLesson(lesson.id);
      for (const item of items) {
        allGrammar.push({
          ...item,
          lessonTitle: lesson.title,
        });
      }
    } catch (e) {
      console.error(`Error loading grammar for ${lesson.id}:`, e);
    }
  }

  return allGrammar;
}

