import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { VocabularyExplorer } from "../../components/vocabulary/VocabularyExplorer";
import { getVocabularyByLesson } from "../../lib/content/vocabulary";

export default function VocabularyPage() {
  const vocabulary = getVocabularyByLesson("lesson-01");

  return (
    <DashboardLayout>
      <div className="vocabulary-page">
        <header className="vocabulary-page-header">
          <div>
            <p className="eyebrow">GIÁO TRÌNH TIẾNG HÀN TỔNG HỢP · QUYỂN 1</p>
            <h1>Bài 1 · 자기소개</h1>
            <p className="vocabulary-page-intro">Làm quen với những từ vựng đầu tiên để giới thiệu bản thân bằng tiếng Hàn.</p>
          </div>
          <div className="vocabulary-count"><strong>{vocabulary.length}</strong><span>từ vựng<br />trong bài</span></div>
        </header>
        <VocabularyExplorer
          entries={vocabulary}
          lessonContext={{ courseId: "tong-hop", bookId: "book-01", lessonId: "lesson-01" }}
        />
      </div>
    </DashboardLayout>
  );
}
