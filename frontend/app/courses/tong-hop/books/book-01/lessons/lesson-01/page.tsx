import { DashboardLayout } from "../../../../../../../components/dashboard/DashboardLayout";
import { LessonOverview } from "../../../../../../../components/lesson/LessonOverview";
import { getGrammarByLesson } from "../../../../../../../lib/content/grammar";
import { getVocabularyByLesson } from "../../../../../../../lib/content/vocabulary";

export default function LessonPage() {
  const vocabulary = getVocabularyByLesson("lesson-01");
  const grammar = getGrammarByLesson("lesson-01");

  return (
    <DashboardLayout>
      <LessonOverview vocabularyCount={vocabulary.length} grammarCount={grammar.length} />
    </DashboardLayout>
  );
}
