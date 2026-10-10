import { headers } from "next/headers";
import { auth } from "./auth";
import prisma from "./prisma";
import { getTotalLessonsCount, getAvailableLessons } from "./content/lesson";
import { getVocabularyByLesson } from "./content/vocabulary";
import { getGrammarByLesson } from "./content/grammar";

export type LessonProgressStatus = "completed" | "in_progress" | "not_started";

export type LessonDetailProgress = {
  lessonId: string;
  order: number;
  title: string;
  sub: string;
  hasContent: boolean;
  status: LessonProgressStatus;
  vocab: {
    mastered: number;
    total: number;
    percent: number;
  };
  grammar: {
    learned: number;
    total: number;
    percent: number;
  };
  overallPercent: number;
};

export type CourseFullStats = {
  courseId: string;
  bookId: string;
  courseProgress: {
    completedLessons: number;
    totalLessons: number;
    percent: number;
  };
  lessonsDetail: LessonDetailProgress[];
  practice: {
    totalQuestionsAttempted: number;
    correctAnswersCount: number;
    accuracyRate: number;
    attemptsCount: number;
    hasData: boolean;
  };
};

/**
 * Calculates vocabulary, grammar, and overall progress for a single lesson.
 * Formula:
 * - Vocab progress = mastered / total * 100%
 * - Grammar progress = learned / total * 100%
 * - Overall lesson progress = 50% * vocab + 50% * grammar (normalized if one component missing)
 * - Auto-completion: when both available components reach 100%, status is "completed".
 */
export async function getSingleLessonProgressDetails(
  userId: string | null,
  courseId = "tong-hop",
  bookId = "book-01",
  lessonId = "lesson-01"
): Promise<{
  lessonId: string;
  totalVocab: number;
  masteredVocab: number;
  vocabPercent: number;
  totalGrammar: number;
  learnedGrammar: number;
  grammarPercent: number;
  overallPercent: number;
  status: LessonProgressStatus;
}> {
  let totalVocab = 0;
  try {
    const vocabList = getVocabularyByLesson(lessonId);
    totalVocab = vocabList.length;
  } catch {
    totalVocab = 0;
  }

  let totalGrammar = 0;
  try {
    const grammarList = getGrammarByLesson(lessonId);
    totalGrammar = grammarList.length;
  } catch {
    totalGrammar = 0;
  }

  let masteredVocab = 0;
  let learnedGrammar = 0;
  let hasVisited = false;

  if (userId) {
    try {
      masteredVocab = await prisma.userItemProgress.count({
        where: {
          userId,
          courseId,
          bookId,
          lessonId,
          itemType: "vocabulary",
          masteredAt: { not: null },
        },
      });

      learnedGrammar = await prisma.userItemProgress.count({
        where: {
          userId,
          courseId,
          bookId,
          lessonId,
          itemType: "grammar",
          masteredAt: { not: null },
        },
      });

      const lessonRecord = await prisma.userLessonProgress.findUnique({
        where: {
          userId_courseId_bookId_lessonId: {
            userId,
            courseId,
            bookId,
            lessonId,
          },
        },
      });

      if (lessonRecord) {
        hasVisited = true;
      }
    } catch (e) {
      console.error(`Error calculating lesson progress for ${lessonId}:`, e);
    }
  }

  const vocabPercent = totalVocab > 0 ? Math.round((masteredVocab / totalVocab) * 100) : 0;
  const grammarPercent = totalGrammar > 0 ? Math.round((learnedGrammar / totalGrammar) * 100) : 0;

  // Calculate overall lesson progress
  let overallPercent = 0;
  if (totalVocab > 0 && totalGrammar > 0) {
    overallPercent = Math.round(0.5 * vocabPercent + 0.5 * grammarPercent);
  } else if (totalVocab > 0) {
    overallPercent = vocabPercent;
  } else if (totalGrammar > 0) {
    overallPercent = grammarPercent;
  }

  // Determine auto-completion condition
  const isVocabComplete = totalVocab === 0 || (totalVocab > 0 && masteredVocab >= totalVocab);
  const isGrammarComplete = totalGrammar === 0 || (totalGrammar > 0 && learnedGrammar >= totalGrammar);
  const isCompleted = (totalVocab > 0 || totalGrammar > 0) && isVocabComplete && isGrammarComplete;

  let status: LessonProgressStatus = "not_started";
  if (isCompleted) {
    status = "completed";
  } else if (masteredVocab > 0 || learnedGrammar > 0 || hasVisited) {
    status = "in_progress";
  }

  // Auto-sync status to database if userId exists
  if (userId && (totalVocab > 0 || totalGrammar > 0)) {
    try {
      const existing = await prisma.userLessonProgress.findUnique({
        where: {
          userId_courseId_bookId_lessonId: {
            userId,
            courseId,
            bookId,
            lessonId,
          },
        },
      });

      if (isCompleted) {
        if (!existing || existing.status !== "completed") {
          const now = new Date();
          await prisma.userLessonProgress.upsert({
            where: {
              userId_courseId_bookId_lessonId: {
                userId,
                courseId,
                bookId,
                lessonId,
              },
            },
            update: {
              status: "completed",
              completedAt: now,
              lastAccessedAt: now,
            },
            create: {
              userId,
              courseId,
              bookId,
              lessonId,
              status: "completed",
              completedAt: now,
              lastAccessedAt: now,
            },
          });
        }
      } else if (existing && existing.status === "completed") {
        // Regressed below 100%
        await prisma.userLessonProgress.update({
          where: {
            userId_courseId_bookId_lessonId: {
              userId,
              courseId,
              bookId,
              lessonId,
            },
          },
          data: {
            status: "in_progress",
            completedAt: null,
          },
        });
      }
    } catch (e) {
      console.error(`Error auto-syncing lesson status for ${lessonId}:`, e);
    }
  }

  return {
    lessonId,
    totalVocab,
    masteredVocab,
    vocabPercent,
    totalGrammar,
    learnedGrammar,
    grammarPercent,
    overallPercent,
    status,
  };
}

/**
 * Synchronizes lesson progress status in the database based on vocab and grammar mastery.
 * When both reach 100%, status becomes "completed".
 */
export async function syncLessonProgress(
  userId: string,
  courseId: string,
  bookId: string,
  lessonId: string
) {
  return getSingleLessonProgressDetails(userId, courseId, bookId, lessonId);
}

export async function getLessonStatus(
  courseId: string,
  bookId: string,
  lessonId: string
): Promise<LessonProgressStatus> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const details = await getSingleLessonProgressDetails(
    session?.user?.id || null,
    courseId,
    bookId,
    lessonId
  );

  return details.status;
}

export async function getUserLessonStatuses(
  courseId = "tong-hop",
  bookId = "book-01"
): Promise<Record<string, LessonProgressStatus>> {
  const syllabus = getAvailableLessons(courseId, bookId);
  const statusMap: Record<string, LessonProgressStatus> = {};

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id || null;

  for (const item of syllabus) {
    if (item.hasContent) {
      const details = await getSingleLessonProgressDetails(userId, courseId, bookId, item.id);
      statusMap[item.id] = details.status;
    } else {
      statusMap[item.id] = "not_started";
    }
  }

  return statusMap;
}

export async function getPracticeStats(courseId = "tong-hop", bookId = "book-01") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || !session.user.id) {
    return {
      totalQuestionsAttempted: 0,
      correctAnswersCount: 0,
      accuracyRate: 0,
      attemptsCount: 0,
      hasData: false,
    };
  }

  try {
    const attempts = await prisma.practiceAttempt.findMany({
      where: {
        userId: session.user.id,
        courseId,
        bookId,
      },
    });

    if (attempts.length === 0) {
      return {
        totalQuestionsAttempted: 0,
        correctAnswersCount: 0,
        accuracyRate: 0,
        attemptsCount: 0,
        hasData: false,
      };
    }

    const totalQuestionsAttempted = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const correctAnswersCount = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const accuracyRate =
      totalQuestionsAttempted > 0
        ? Math.round((correctAnswersCount / totalQuestionsAttempted) * 100)
        : 0;

    return {
      totalQuestionsAttempted,
      correctAnswersCount,
      accuracyRate,
      attemptsCount: attempts.length,
      hasData: true,
    };
  } catch (error) {
    console.error("Failed to fetch practice stats:", error);
    return {
      totalQuestionsAttempted: 0,
      correctAnswersCount: 0,
      accuracyRate: 0,
      attemptsCount: 0,
      hasData: false,
    };
  }
}

export async function getCourseFullStats(courseId = "tong-hop", bookId = "book-01"): Promise<CourseFullStats> {
  const totalLessons = getTotalLessonsCount(courseId, bookId);
  const syllabus = getAvailableLessons(courseId, bookId);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id || null;

  const lessonsDetail: LessonDetailProgress[] = [];
  let completedCount = 0;

  for (const item of syllabus) {
    if (item.hasContent) {
      const details = await getSingleLessonProgressDetails(userId, courseId, bookId, item.id);
      if (details.status === "completed") {
        completedCount++;
      }
      lessonsDetail.push({
        lessonId: item.id,
        order: item.order,
        title: item.title,
        sub: item.sub,
        hasContent: true,
        status: details.status,
        vocab: {
          mastered: details.masteredVocab,
          total: details.totalVocab,
          percent: details.vocabPercent,
        },
        grammar: {
          learned: details.learnedGrammar,
          total: details.totalGrammar,
          percent: details.grammarPercent,
        },
        overallPercent: details.overallPercent,
      });
    } else {
      lessonsDetail.push({
        lessonId: item.id,
        order: item.order,
        title: item.title,
        sub: item.sub,
        hasContent: false,
        status: "not_started",
        vocab: {
          mastered: 0,
          total: 0,
          percent: 0,
        },
        grammar: {
          learned: 0,
          total: 0,
          percent: 0,
        },
        overallPercent: 0,
      });
    }
  }

  // Course Progress Formula: completedLessons / totalLessons * 100%
  const coursePercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const practice = await getPracticeStats(courseId, bookId);

  return {
    courseId,
    bookId,
    courseProgress: {
      completedLessons: completedCount,
      totalLessons,
      percent: coursePercent,
    },
    lessonsDetail,
    practice,
  };
}

export async function getLessonProgressStats(courseId = "tong-hop", bookId = "book-01") {
  const fullStats = await getCourseFullStats(courseId, bookId);
  return {
    completedLessons: fullStats.courseProgress.completedLessons,
    totalLessons: fullStats.courseProgress.totalLessons,
  };
}
