import { headers } from "next/headers";
import { DashboardLayout } from "../../../../../../../components/dashboard/DashboardLayout";
import { LessonOverview } from "../../../../../../../components/lesson/LessonOverview";
import { LessonTracker } from "../../../../../../../components/lesson/LessonTracker";
import { getSingleLessonProgressDetails } from "../../../../../../../lib/progress";
import { auth } from "../../../../../../../lib/auth";

export default async function LessonPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const details = await getSingleLessonProgressDetails(
    session?.user?.id || null,
    "tong-hop",
    "book-01",
    "lesson-01"
  );

  return (
    <DashboardLayout>
      <LessonTracker courseId="tong-hop" bookId="book-01" lessonId="lesson-01" />
      <LessonOverview
        vocabularyCount={details.totalVocab}
        masteredVocabCount={details.masteredVocab}
        vocabPercent={details.vocabPercent}
        grammarCount={details.totalGrammar}
        learnedGrammarCount={details.learnedGrammar}
        grammarPercent={details.grammarPercent}
        overallPercent={details.overallPercent}
        courseId="tong-hop"
        bookId="book-01"
        lessonId="lesson-01"
        lessonStatus={details.status}
      />
    </DashboardLayout>
  );
}
