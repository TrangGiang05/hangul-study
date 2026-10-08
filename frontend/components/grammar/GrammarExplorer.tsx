"use client";

import { useState } from "react";
import type { GrammarEntry } from "../../lib/content/grammar";
import { useAITutor } from "../ai/AITutorContext";
import { toggleGrammarMastery } from "../../app/actions/grammar";

type LessonContext = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

type GrammarExplorerProps = {
  entries: GrammarEntry[];
  lessonContext?: LessonContext;
  initialLearnedState?: LearnedState;
};
type LearnedState = Record<string, boolean>;

function speakKorean(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
}

export function GrammarExplorer({
  entries,
  lessonContext,
  initialLearnedState = {},
}: GrammarExplorerProps) {
  const { openAITutor } = useAITutor();
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? "");
  const [learnedState, setLearnedState] = useState<LearnedState>(initialLearnedState);
  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const learnedCount = entries.filter((entry) => learnedState[entry.id]).length;

  if (!selectedEntry) {
    return (
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center space-y-3">
        <span className="text-3xl">📐</span>
        <h3 className="font-bold text-[#1e293b]">Chưa có dữ liệu ngữ pháp.</h3>
        <p className="text-xs text-[#64748b]">Hãy bổ sung nội dung cho bài học này trước.</p>
      </div>
    );
  }

  const isLearned = learnedState[selectedEntry.id] ?? false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl mx-auto">
      {/* Left Column: Navigation list of grammar points (4 cols) */}
      <nav
        className="lg:col-span-4 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-2xs space-y-3"
        aria-label="Danh sách điểm ngữ pháp"
      >
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 px-1">
          <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
            Trong bài này
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563eb]">
            {learnedCount}/{entries.length} đã học
          </span>
        </div>

        <div className="space-y-1.5">
          {entries.map((entry, index) => {
            const active = entry.id === selectedEntry.id;
            const learned = learnedState[entry.id];
            return (
              <button
                key={entry.id}
                type="button"
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border ${
                  active
                    ? "bg-[#ebf2ff] border-[#bfdbfe] text-[#2563eb]"
                    : "bg-[#f8fafc] border-transparent hover:bg-white hover:border-[#e2e8f0] text-[#334155]"
                }`}
                onClick={() => setSelectedId(entry.id)}
                aria-pressed={active}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      active
                        ? "bg-[#2563eb] text-white"
                        : "bg-white text-[#64748b] border border-[#e2e8f0]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{entry.title}</p>
                    <p className="text-[11px] text-[#64748b] truncate">{entry.meaning}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold shrink-0 ${
                    learned ? "text-emerald-600" : "text-transparent"
                  }`}
                  aria-label={learned ? "Đã học" : "Chưa học"}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Right Column: Detailed Grammar Point Card (8 cols) */}
      <article
        className="lg:col-span-8 rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-2xs space-y-6"
        aria-live="polite"
        aria-labelledby="grammar-detail-title"
      >
        {/* Header & Pattern */}
        <div className="border-b border-[#f1f5f9] pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-md">
              ĐIỂM NGỮ PHÁP · {selectedEntry.id}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  openAITutor({
                    courseId: lessonContext?.courseId ?? "tong-hop",
                    bookId: lessonContext?.bookId ?? "book-01",
                    lessonId: lessonContext?.lessonId ?? "lesson-01",
                    module: "grammar",
                    contentId: selectedEntry.id,
                  });
                }}
                className="grammar-ai-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563eb] bg-[#ebf2ff] hover:bg-[#dbeafe] rounded-lg transition-colors"
              >
                Hỏi AI ↗
              </button>
            </div>
          </div>

          <h2
            id="grammar-detail-title"
            className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight"
          >
            {selectedEntry.pattern || selectedEntry.title}
          </h2>

          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
                Ý nghĩa cấu trúc:
              </span>
              <p className="text-sm font-semibold text-[#1e293b] mt-0.5">{selectedEntry.meaning}</p>
            </div>
            {selectedEntry.pattern && (
              <span className="text-sm font-bold text-[#2563eb] bg-white px-3 py-1 rounded-lg border border-blue-100 shrink-0">
                {selectedEntry.pattern}
              </span>
            )}
          </div>
        </div>

        {/* Section: Cách sử dụng */}
        {selectedEntry.explanation && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1e293b]">
              Cách sử dụng
            </h3>
            <div className="text-sm text-[#334155] leading-relaxed p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              {selectedEntry.explanation}
            </div>
          </div>
        )}

        {/* Section: Ghi nhớ / Cấu trúc */}
        {selectedEntry.structure && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1e293b]">
              Cấu trúc & Ghi nhớ
            </h3>
            <div className="text-sm text-[#334155] font-medium p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-[#1e40af]">
              {selectedEntry.structure}
            </div>
          </div>
        )}

        {/* Section: Ví dụ */}
        {selectedEntry.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1e293b]">
              Ví dụ thực tế
            </h3>
            <div className="space-y-2.5">
              {selectedEntry.examples.map((example, index) => (
                <div
                  key={`${selectedEntry.id}-example-${index}`}
                  className="p-3.5 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-bold text-[#1e293b]">{example.korean}</p>
                    <p className="text-xs text-[#64748b]">{example.translation}</p>
                    {example.notes && (
                      <p className="text-[11px] text-[#94a3b8] italic">({example.notes})</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => speakKorean(example.korean)}
                    className="p-1.5 text-[#64748b] hover:text-[#2563eb] rounded-lg hover:bg-[#ebf2ff] transition-colors shrink-0"
                    title="Nghe phát âm"
                    aria-label={`Nghe phát âm ví dụ ${example.korean}`}
                  >
                    🔊
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Lưu ý / Warning Note Box */}
        {selectedEntry.notes && (
          <div className="p-4 rounded-xl border border-[#fed7aa] bg-[#fffaf5] space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <span>⚠️ Lưu ý quan trọng</span>
            </div>
            <p className="text-xs text-[#78350f] leading-relaxed">{selectedEntry.notes}</p>
          </div>
        )}

        {/* Footer Mastery Action Button */}
        <div className="pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
          <span className="text-xs text-[#64748b]">
            Đã nắm vững điểm ngữ pháp này?
          </span>

          <button
            type="button"
            className={`grammar-learned-button px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              isLearned
                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs is-learned"
                : "bg-white border-[#2563eb] text-[#2563eb] hover:bg-blue-50"
            }`}
            onClick={async () => {
              const nextIsLearned = !isLearned;

              setLearnedState((current) => ({
                ...current,
                [selectedEntry.id]: nextIsLearned,
              }));

              if (lessonContext) {
                const res = await toggleGrammarMastery({
                  ...lessonContext,
                  itemId: selectedEntry.id,
                  isLearned: nextIsLearned,
                });

                if (res && !res.success && res.error !== "Unauthorized") {
                  setLearnedState((current) => ({
                    ...current,
                    [selectedEntry.id]: isLearned,
                  }));
                }
              }
            }}
          >
            {isLearned ? "✓ Đã học" : "Đánh dấu đã học"}
          </button>
        </div>
      </article>
    </div>
  );
}
