import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { PracticeExplorer } from "../../components/practice/PracticeExplorer";
import { getVocabularyByLesson } from "../../lib/content/vocabulary";
import { createVocabularyPracticeQuestions } from "../../lib/practice/vocabularyQuestions";
import { createVocabularyTypingQuestions } from "../../lib/practice/vocabularyQuestions";

export default function PracticePage() {
  const vocabulary = getVocabularyByLesson("lesson-01");
  const initialQuestions = createVocabularyPracticeQuestions(vocabulary);
  const initialTypingWords = createVocabularyTypingQuestions(vocabulary);

  return (
    <DashboardLayout>
      <div className="practice-page">
        <header className="practice-page-header">
          <div>
            <p className="eyebrow">LUYỆN TẬP</p>
            <h1>Bài 1 · 자기소개</h1>
            <p>Ôn lại từ vựng bằng những câu hỏi ngắn và rõ ràng.</p>
          </div>
          <span className="practice-header-count">{initialQuestions.length} câu</span>
        </header>
        <PracticeExplorer
          entries={vocabulary}
          initialQuestions={initialQuestions}
          initialTypingWords={initialTypingWords}
          lessonContext={{ courseId: "tong-hop", bookId: "book-01", lessonId: "lesson-01" }}
        />
      </div>
    </DashboardLayout>
  );
}
