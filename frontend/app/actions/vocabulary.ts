"use server";

import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { getVocabularyByLesson } from "../../lib/content/vocabulary";

type ToggleVocabularyInput = {
  courseId: string;
  bookId: string;
  lessonId: string;
  itemId: string;
  isKnown: boolean;
};

export async function toggleVocabularyMastery(input: ToggleVocabularyInput) {
  // 1. Get authenticated user securely from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // 2. Validate content identity
  try {
    const vocabList = getVocabularyByLesson(input.lessonId);
    const itemExists = vocabList.some((item) => item.id === input.itemId);
    if (!itemExists) {
      return { success: false, error: "Invalid item ID" };
    }
  } catch (error) {
    return { success: false, error: "Curriculum validation failed" };
  }

  // 3. Prisma mutation
  try {
    const now = new Date();
    
    await prisma.userItemProgress.upsert({
      where: {
        userId_courseId_bookId_lessonId_itemType_itemId: {
          userId,
          courseId: input.courseId,
          bookId: input.bookId,
          lessonId: input.lessonId,
          itemType: "vocabulary",
          itemId: input.itemId,
        },
      },
      update: {
        masteredAt: input.isKnown ? now : null,
      },
      create: {
        userId,
        courseId: input.courseId,
        bookId: input.bookId,
        lessonId: input.lessonId,
        itemType: "vocabulary",
        itemId: input.itemId,
        masteredAt: input.isKnown ? now : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle vocabulary mastery:", error);
    return { success: false, error: "Internal server error" };
  }
}
