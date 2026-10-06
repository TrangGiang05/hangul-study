"use server";

import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { getVocabularyByLesson } from "../../lib/content/vocabulary";

type SavePracticeAttemptInput = {
  courseId: string;
  bookId: string;
  lessonId: string;
  mode: string;
  score: number;
  totalQuestions: number;
};

export async function savePracticeAttempt(input: SavePracticeAttemptInput) {
  // 1. Get authenticated user securely from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // Validate curriculum identity
  try {
    getVocabularyByLesson(input.lessonId);
  } catch (error) {
    return { success: false, error: "Curriculum validation failed" };
  }

  // 2. Validate score and totalQuestions
  if (input.totalQuestions <= 0) {
    return { success: false, error: "Invalid total questions" };
  }
  if (input.score < 0 || input.score > input.totalQuestions) {
    return { success: false, error: "Invalid score" };
  }

  // 3. Prisma mutation
  try {
    await prisma.practiceAttempt.create({
      data: {
        userId,
        courseId: input.courseId,
        bookId: input.bookId,
        lessonId: input.lessonId,
        mode: input.mode,
        score: input.score,
        totalQuestions: input.totalQuestions,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save practice attempt:", error);
    return { success: false, error: "Internal server error" };
  }
}
