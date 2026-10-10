import { readFileSync } from "node:fs";
import path from "node:path";
import { getAvailableLessons } from "./lesson";

export type VocabularyExample = {
  korean: string;
  translation: string;
};

export type VocabularyEntry = {
  id: string;
  lessonId?: string;
  lessonTitle?: string;
  korean: string;
  meaning: string;
  partOfSpeech: string;
  examples: VocabularyExample[];
  notes: string;
  practiceHint?: string;
};

export function getVocabularyByLesson(lessonSlug: string): (VocabularyEntry & { lessonId: string })[] {
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
    const parsed = JSON.parse(fileContents) as VocabularyEntry[];
    return parsed.map((item) => ({
      ...item,
      lessonId: lessonSlug,
    }));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Vocabulary file not found for lesson "${lessonSlug}": ${filePath}`);
    }

    throw new Error(`Unable to load vocabulary for lesson "${lessonSlug}": ${filePath}`);
  }
}

export function getAllVocabulary(courseId = "tong-hop", bookId = "book-01"): (VocabularyEntry & { lessonId: string })[] {
  const lessons = getAvailableLessons(courseId, bookId).filter((l) => l.hasContent);
  const allVocab: (VocabularyEntry & { lessonId: string })[] = [];

  for (const lesson of lessons) {
    try {
      const items = getVocabularyByLesson(lesson.id);
      for (const item of items) {
        allVocab.push({
          ...item,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        });
      }
    } catch (e) {
      console.error(`Error loading vocabulary for ${lesson.id}:`, e);
    }
  }

  return allVocab;
}
