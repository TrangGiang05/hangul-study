"use server";

import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import { getGrammarByLesson } from "../../lib/content/grammar";

type ToggleGrammarInput = {
  courseId: string;
  bookId: string;
  lessonId: string;
  itemId: string;
  isLearned: boolean;
};

export async function toggleGrammarMastery(input: ToggleGrammarInput) {
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
    const grammarList = getGrammarByLesson(input.lessonId);
    const itemExists = grammarList.some((item) => item.id === input.itemId);
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
          itemType: "grammar",
          itemId: input.itemId,
        },
      },
      update: {
        masteredAt: input.isLearned ? now : null,
      },
      create: {
        userId,
        courseId: input.courseId,
        bookId: input.bookId,
        lessonId: input.lessonId,
        itemType: "grammar",
        itemId: input.itemId,
        masteredAt: input.isLearned ? now : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle grammar mastery:", error);
    return { success: false, error: "Internal server error" };
  }
}
