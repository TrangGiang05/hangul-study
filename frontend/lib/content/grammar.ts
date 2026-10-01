import { readFileSync } from "node:fs";
import path from "node:path";

export type GrammarExample = {
  korean: string;
  translation: string;
  notes: string;
};

export type GrammarEntry = {
  id: string;
  lessonId: string;
  title: string;
  pattern: string;
  meaning: string;
  explanation: string;
  structure: string;
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
