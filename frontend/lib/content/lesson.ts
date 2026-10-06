import fs from "node:fs";
import path from "node:path";

export function getTotalLessonsCount(courseId: string, bookId: string): number {
  const lessonsDir = path.join(
    process.cwd(),
    "..",
    "data",
    "korean",
    "courses",
    courseId,
    "books",
    bookId,
    "lessons",
  );

  try {
    const entries = fs.readdirSync(lessonsDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).length;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read lessons directory for ${courseId}/${bookId}: ${error.message}`);
    }
    throw new Error(`Failed to read lessons directory for ${courseId}/${bookId}`);
  }
}
