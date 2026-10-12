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
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6 mb-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              LUYỆN TẬP
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
              Bài 1 · 자기소개
            </h1>
            <p className="text-xs md:text-sm text-[#64748b] mt-1 max-w-2xl">
              Ôn lại từ vựng bằng những câu hỏi ngắn và rõ ràng.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#ebf2ff] text-[#2563eb] shrink-0 self-start sm:self-end">
            <strong className="text-2xl font-bold">{initialQuestions.length}</strong>
            <span className="text-[11px] text-[#475569] leading-tight font-medium">
              câu hỏi<br />luyện tập
            </span>
          </div>
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
