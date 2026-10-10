import { headers } from "next/headers";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { GrammarExplorer } from "../../components/grammar/GrammarExplorer";
import { getAllGrammar } from "../../lib/content/grammar";
import { getAvailableLessons, isValidLessonId } from "../../lib/content/lesson";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";

type GrammarPageProps = {
  searchParams?: Promise<{
    lessonId?: string;
  }>;
};

export default async function GrammarPage({ searchParams }: GrammarPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const requestedLessonId = resolvedParams?.lessonId;

  const allGrammar = getAllGrammar("tong-hop", "book-01");
  const availableLessons = getAvailableLessons("tong-hop", "book-01");

  const isInvalidLesson =
    Boolean(requestedLessonId) && !isValidLessonId(requestedLessonId as string, "tong-hop", "book-01");

  const session = await auth.api.getSession({ headers: await headers() });
  const initialLearnedState: Record<string, boolean> = {};

  if (session?.user?.id) {
    try {
      const progresses = await prisma.userItemProgress.findMany({
        where: {
          userId: session.user.id,
          courseId: "tong-hop",
          bookId: "book-01",
          itemType: "grammar",
        },
      });

      for (const p of progresses) {
        initialLearnedState[p.itemId] = p.masteredAt !== null;
      }
    } catch (e) {
      console.error("Failed to fetch grammar progress in GrammarPage:", e);
    }
  }

  // Subtitle based on scope
  const targetLesson = availableLessons.find((l) => l.id === requestedLessonId);
  const subtitle = targetLesson
    ? `${targetLesson.title}: Hiểu cách giới thiệu bản thân và đặt câu hỏi đơn giản bằng tiếng Hàn.`
    : "Kho ngữ pháp Tiếng Hàn Tổng hợp Sơ cấp 1. Tra cứu và ôn tập các cấu trúc ngữ pháp.";

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              NGỮ PHÁP · TIẾNG HÀN TỔNG HỢP
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
              Ngữ pháp
            </h1>
            <p className="text-xs md:text-sm text-[#64748b] mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>
        </header>

        <GrammarExplorer
          allEntries={allGrammar}
          availableLessons={availableLessons}
          initialLessonId={requestedLessonId}
          isInvalidLesson={isInvalidLesson}
          initialLearnedState={initialLearnedState}
        />
      </div>
    </DashboardLayout>
  );
}
