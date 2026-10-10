import { headers } from "next/headers";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { VocabularyExplorer } from "../../components/vocabulary/VocabularyExplorer";
import { getAllVocabulary } from "../../lib/content/vocabulary";
import { getAvailableLessons, isValidLessonId } from "../../lib/content/lesson";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";

type VocabularyPageProps = {
  searchParams?: Promise<{
    lessonId?: string;
  }>;
};

export default async function VocabularyPage({ searchParams }: VocabularyPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const requestedLessonId = resolvedParams?.lessonId;

  const allVocabulary = getAllVocabulary("tong-hop", "book-01");
  const availableLessons = getAvailableLessons("tong-hop", "book-01");

  const isInvalidLesson =
    Boolean(requestedLessonId) && !isValidLessonId(requestedLessonId as string, "tong-hop", "book-01");

  const session = await auth.api.getSession({ headers: await headers() });
  const initialKnownState: Record<string, boolean> = {};

  if (session?.user?.id) {
    try {
      const progresses = await prisma.userItemProgress.findMany({
        where: {
          userId: session.user.id,
          courseId: "tong-hop",
          bookId: "book-01",
          itemType: "vocabulary",
        },
      });

      for (const p of progresses) {
        initialKnownState[p.itemId] = p.masteredAt !== null;
      }
    } catch (e) {
      console.error("Failed to fetch vocabulary progress in VocabularyPage:", e);
    }
  }

  // Determine header subtitle based on scope
  const targetLesson = availableLessons.find((l) => l.id === requestedLessonId);
  const subtitle = targetLesson
    ? `${targetLesson.title}: Làm quen với những từ vựng đầu tiên để giới thiệu bản thân bằng tiếng Hàn.`
    : "Kho từ vựng Tiếng Hàn Tổng hợp Sơ cấp 1. Tra cứu và ôn tập từ vựng các bài học.";

  return (
    <DashboardLayout>
      <div className="vocabulary-page p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <header className="vocabulary-page-header flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6">
          <div>
            <p className="eyebrow text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              TỪ VỰNG · TIẾNG HÀN TỔNG HỢP
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
              Từ vựng
            </h1>
            <p className="vocabulary-page-intro text-xs md:text-sm text-[#64748b] mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>
          <div className="vocabulary-count flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#ebf2ff] text-[#2563eb] shrink-0 self-start sm:self-end">
            <strong className="text-2xl font-bold">{allVocabulary.length}</strong>
            <span className="text-[11px] text-[#475569] leading-tight font-medium">
              từ vựng<br />trong sách
            </span>
          </div>
        </header>

        <VocabularyExplorer
          allEntries={allVocabulary}
          availableLessons={availableLessons}
          initialLessonId={requestedLessonId}
          isInvalidLesson={isInvalidLesson}
          initialKnownState={initialKnownState}
        />
      </div>
    </DashboardLayout>
  );
}
