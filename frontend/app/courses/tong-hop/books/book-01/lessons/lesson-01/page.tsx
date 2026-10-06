import { DashboardLayout } from "../../../../../../../components/dashboard/DashboardLayout";
import { LessonOverview } from "../../../../../../../components/lesson/LessonOverview";
import { LessonTracker } from "../../../../../../../components/lesson/LessonTracker";
import { getGrammarByLesson } from "../../../../../../../lib/content/grammar";
import { getVocabularyByLesson } from "../../../../../../../lib/content/vocabulary";

export default function LessonPage() {
  const vocabulary = getVocabularyByLesson("lesson-01");
  const grammar = getGrammarByLesson("lesson-01");

  return (
    <DashboardLayout>
      <LessonTracker courseId="tong-hop" bookId="book-01" lessonId="lesson-01" />
      <LessonOverview vocabularyCount={vocabulary.length} grammarCount={grammar.length} />
    </DashboardLayout>
  );
}
