import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { GrammarExplorer } from "../../components/grammar/GrammarExplorer";
import { getGrammarByLesson } from "../../lib/content/grammar";

export default function GrammarPage() {
  const grammar = getGrammarByLesson("lesson-01");

  return (
    <DashboardLayout>
      <div className="grammar-page">
        <header className="grammar-page-header">
          <div>
            <p className="eyebrow">NGỮ PHÁP</p>
            <h1>Bài 1 · 자기소개</h1>
            <p className="grammar-page-intro">Hiểu cách giới thiệu bản thân và đặt câu hỏi đơn giản bằng tiếng Hàn.</p>
          </div>
          <div className="grammar-count"><strong>{grammar.length}</strong><span>điểm ngữ pháp<br />trong bài</span></div>
        </header>
        <GrammarExplorer
          entries={grammar}
          lessonContext={{ courseId: "tong-hop", bookId: "book-01", lessonId: "lesson-01" }}
        />
      </div>
    </DashboardLayout>
  );
}
