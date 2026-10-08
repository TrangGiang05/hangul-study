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
      <div className="grammar-page">
        <header className="grammar-page-header">
          <div>
            <p className="eyebrow">NGỮ PHÁP · TIẾNG HÀN TỔNG HỢP</p>
            <h1>Ngữ pháp</h1>
            <p className="grammar-page-intro">Bài 1 · 자기소개: Hiểu cách giới thiệu bản thân và đặt câu hỏi đơn giản bằng tiếng Hàn.</p>
          </div>
          <div className="grammar-count"><strong>{grammar.length}</strong><span>điểm ngữ pháp<br />trong bài</span></div>
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
