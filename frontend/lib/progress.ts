import { headers } from "next/headers";
import { auth } from "./auth";
import prisma from "./prisma";
import { getTotalLessonsCount } from "./content/lesson";

export async function getLessonProgressStats() {
  const courseId = "tong-hop";
  const bookId = "book-01";
  const totalLessons = getTotalLessonsCount(courseId, bookId);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return {
      completedLessons: 0,
      totalLessons,
    };
  }

  const userId = session.user.id;

  try {
    const completedCount = await prisma.userLessonProgress.count({
      where: {
        userId,
        courseId,
        bookId,
        status: "completed",
      },
    });

    return {
      completedLessons: completedCount,
      totalLessons,
    };
  } catch (error) {
    console.error("Failed to fetch lesson progress from database:", error);
    throw new Error("Failed to fetch user lesson progress.");
  }
}
