import { readFileSync } from "node:fs";
import path from "node:path";

export type VocabularyExample = {
  korean: string;
  translation: string;
};

export type VocabularyEntry = {
  id: string;
  korean: string;
  meaning: string;
  partOfSpeech: string;
  examples: VocabularyExample[];
  notes: string;
};

export function getVocabularyByLesson(lessonSlug: string): VocabularyEntry[] {
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
    "vocabulary.json",
  );

  try {
    const fileContents = readFileSync(filePath, "utf8");
    return JSON.parse(fileContents) as VocabularyEntry[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Vocabulary file not found for lesson "${lessonSlug}": ${filePath}`);
    }

    throw new Error(`Unable to load vocabulary for lesson "${lessonSlug}": ${filePath}`);
  }
}
