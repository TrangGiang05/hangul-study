import { headers } from "next/headers";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { GrammarExplorer } from "../../components/grammar/GrammarExplorer";
import { getGrammarByLesson } from "../../lib/content/grammar";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";

export default async function GrammarPage() {
  const grammar = getGrammarByLesson("lesson-01");
  const session = await auth.api.getSession({ headers: await headers() });
  
  const initialLearnedState: Record<string, boolean> = {};

  if (session?.user?.id) {
    const progresses = await prisma.userItemProgress.findMany({
      where: {
        userId: session.user.id,
        courseId: "tong-hop",
        bookId: "book-01",
        lessonId: "lesson-01",
        itemType: "grammar",
      }
    });

    for (const p of progresses) {
      if (p.masteredAt !== null) {
        initialLearnedState[p.itemId] = true;
      } else {
        initialLearnedState[p.itemId] = false;
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">NGỮ PHÁP · TIẾNG HÀN TỔNG HỢP</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">Ngữ pháp</h1>
            <p className="text-xs md:text-sm text-[#64748b] mt-1">Bài 1 · 자기소개: Hiểu cách giới thiệu bản thân và đặt câu hỏi đơn giản bằng tiếng Hàn.</p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#ebf2ff] text-[#2563eb] shrink-0 self-start sm:self-end">
            <strong className="text-2xl font-bold">{grammar.length}</strong>
            <span className="text-[11px] text-[#475569] leading-tight font-medium">điểm ngữ pháp<br />trong bài</span>
          </div>
        </header>
        <GrammarExplorer
          entries={grammar}
          lessonContext={{ courseId: "tong-hop", bookId: "book-01", lessonId: "lesson-01" }}
          initialLearnedState={initialLearnedState}
        />
      </div>
    </DashboardLayout>
  );
}
