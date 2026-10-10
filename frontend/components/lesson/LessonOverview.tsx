import Link from "next/link";
import type { LessonProgressStatus } from "../../lib/progress";

type LessonOverviewProps = {
  vocabularyCount: number;
  masteredVocabCount?: number;
  vocabPercent?: number;
  grammarCount: number;
  learnedGrammarCount?: number;
  grammarPercent?: number;
  overallPercent?: number;
  courseId?: string;
  bookId?: string;
  lessonId?: string;
  lessonStatus?: LessonProgressStatus;
};

export function LessonOverview({
  vocabularyCount,
  masteredVocabCount = 0,
  vocabPercent = 0,
  grammarCount,
  learnedGrammarCount = 0,
  grammarPercent = 0,
  overallPercent = 0,
  lessonId = "lesson-01",
  lessonStatus = "not_started",
}: LessonOverviewProps) {
  const isCompleted = lessonStatus === "completed";

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/courses/tong-hop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] transition-colors"
        >
          ← Danh sách bài học
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#94a3b8] hover:text-[#64748b] transition-colors"
        >
          Về trang chủ
        </Link>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
            TIẾNG HÀN TỔNG HỢP · QUYỂN 1
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
            Bài 1 · 자기소개
          </h1>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">
            Giới thiệu bản thân, những câu giao tiếp cơ bản trong cuộc sống hàng ngày.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Status Badge reflecting automatic completion state */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
                ✓ Đã hoàn thành (100%)
              </span>
            ) : lessonStatus === "in_progress" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-[#2563eb] border border-blue-200 text-xs font-bold shadow-2xs">
                Đang học ({overallPercent}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold shadow-2xs">
                Chưa học (0%)
              </span>
            )}
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf2ff] text-base font-extrabold text-[#2563eb]">
            01
          </span>
        </div>
      </header>

      {/* Per-lesson progress card: 50% Vocab + 50% Grammar */}
      <section className="rounded-2xl border border-[#dbeafe] bg-[#ebf2ff]/50 p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
              TIẾN ĐỘ BÀI HỌC
            </span>
            <h2 className="text-lg font-bold text-[#1e293b] mt-0.5">
              {isCompleted
                ? "Chúc mừng! Bạn đã hoàn thành bài học này."
                : `Đạt ${overallPercent}% tiến độ`}
            </h2>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-blue-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-600" : "bg-[#2563eb]"
              }`}
            style={{ width: `${Math.min(100, Math.max(0, overallPercent))}%` }}
          />
        </div>

        {/* Component breakdown */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#475569]">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0]">
            Từ vựng: <strong className="text-[#1e293b]">{masteredVocabCount}/{vocabularyCount} từ</strong> ({vocabPercent}%)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f0]">
            Ngữ pháp: <strong className="text-[#1e293b]">{learnedGrammarCount}/{grammarCount} điểm</strong> ({grammarPercent}%)
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vocabulary Link with lessonId context */}
        <Link
          href={`/vocabulary?lessonId=${lessonId}`}
          className="group p-5 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center text-xl font-bold">
              가
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                PHẦN 01
              </span>
              <h3 className="text-base font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                Từ vựng
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {masteredVocabCount}/{vocabularyCount} từ đã nhớ ({vocabPercent}%)
              </p>
            </div>
          </div>
          <span className="text-[#64748b] group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all text-lg font-bold">
            →
          </span>
        </Link>

        {/* Grammar Link with lessonId context */}
        <Link
          href={`/grammar?lessonId=${lessonId}`}
          className="group p-5 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              문
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                PHẦN 02
              </span>
              <h3 className="text-base font-bold text-[#1e293b] group-hover:text-purple-600 transition-colors">
                Ngữ pháp
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                {learnedGrammarCount}/{grammarCount} điểm đã học ({grammarPercent}%)
              </p>
            </div>
          </div>
          <span className="text-[#64748b] group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all text-lg font-bold">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
