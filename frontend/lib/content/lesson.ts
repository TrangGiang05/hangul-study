import fs from "node:fs";
import path from "node:path";

export type LessonSummary = {
  id: string;
  order: number;
  title: string;
  sub: string;
  hasContent: boolean;
};

export const COURSE_SYLLABUS: LessonSummary[] = [
  { id: "lesson-01", order: 1, title: "Bài 1: 자기소개 (Chào hỏi cơ bản)", sub: "Giới thiệu bản thân, những câu giao tiếp cơ bản trong cuộc sống hàng ngày.", hasContent: true },
  { id: "lesson-02", order: 2, title: "Bài 2: 학교 (Trường học)", sub: "Từ vựng đồ dùng học tập, địa điểm", hasContent: false },
  { id: "lesson-03", order: 3, title: "Bài 3: 일상생활 (Sinh hoạt hàng ngày)", sub: "Động từ hành động, thời gian", hasContent: false },
  { id: "lesson-04", order: 4, title: "Bài 4: 날짜와 요일 (Ngày và thứ)", sub: "Số đếm thuần Hàn, Hán Hàn", hasContent: false },
  { id: "lesson-05", order: 5, title: "Bài 5: 하루 일과 (Một ngày của tôi)", sub: "Miêu tả lịch trình, hoạt động", hasContent: false },
];

export function getAvailableLessons(courseId = "tong-hop", bookId = "book-01"): LessonSummary[] {
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

  let existingDirs: string[] = [];
  try {
    if (fs.existsSync(lessonsDir)) {
      existingDirs = fs
        .readdirSync(lessonsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
    }
  } catch {
    existingDirs = ["lesson-01"];
  }

  return COURSE_SYLLABUS.map((lesson) => ({
    ...lesson,
    hasContent: existingDirs.includes(lesson.id),
  }));
}

export function isValidLessonId(lessonId: string, courseId = "tong-hop", bookId = "book-01"): boolean {
  const lessons = getAvailableLessons(courseId, bookId);
  return lessons.some((l) => l.id === lessonId && l.hasContent);
}

export function getTotalLessonsCount(courseId = "tong-hop", bookId = "book-01"): number {
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

  let dirCount = 0;
  try {
    if (fs.existsSync(lessonsDir)) {
      const entries = fs.readdirSync(lessonsDir, { withFileTypes: true });
      dirCount = entries.filter((entry) => entry.isDirectory()).length;
    }
  } catch {
    dirCount = 1;
  }

  return Math.max(COURSE_SYLLABUS.length, dirCount);
}

