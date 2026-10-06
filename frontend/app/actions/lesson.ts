"use server";

import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { getVocabularyByLesson } from "../../lib/content/vocabulary";

type StartLessonInput = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

export async function startLesson(input: StartLessonInput) {
  // 1. Get authenticated user securely from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // 2. Validate curriculum identity
  if (input.courseId !== "tong-hop" || input.bookId !== "book-01") {
    return { success: false, error: "Invalid course or book" };
  }
  
  try {
    getVocabularyByLesson(input.lessonId);
  } catch {
    return { success: false, error: "Curriculum validation failed" };
  }

  // 3. Prisma mutation
  try {
    const existing = await prisma.userLessonProgress.findUnique({
      where: {
        userId_courseId_bookId_lessonId: {
          userId,
          courseId: input.courseId,
          bookId: input.bookId,
          lessonId: input.lessonId,
        },
      },
    });

    if (existing) {
      // update lastAccessedAt
      await prisma.userLessonProgress.update({
        where: {
          userId_courseId_bookId_lessonId: {
            userId,
            courseId: input.courseId,
            bookId: input.bookId,
            lessonId: input.lessonId,
          },
        },
        data: {
          lastAccessedAt: new Date(),
        },
      });
    } else {
      // create new progress
      await prisma.userLessonProgress.create({
        data: {
          userId,
          courseId: input.courseId,
          bookId: input.bookId,
          lessonId: input.lessonId,
          status: "in_progress",
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to start lesson:", error);
    return { success: false, error: "Internal server error" };
  }
}
