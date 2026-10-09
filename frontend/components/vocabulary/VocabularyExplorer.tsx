"use client";

import { useMemo, useState } from "react";
import type { VocabularyEntry } from "../../lib/content/vocabulary";
import { useAITutor } from "../ai/AITutorContext";
import { toggleVocabularyMastery } from "../../app/actions/vocabulary";

type LessonContext = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

type VocabularyExplorerProps = {
  entries: VocabularyEntry[];
  lessonContext?: LessonContext;
  initialKnownState?: KnownState;
};

type VocabularyFilter = "all" | "unknown" | "known";
type ViewMode = "flashcards" | "list";
type KnownState = Record<string, boolean>;

function speakKorean(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
}

function shuffleEntries(entries: VocabularyEntry[]) {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export function VocabularyExplorer({
  entries,
  lessonContext,
  initialKnownState = {},
}: VocabularyExplorerProps) {
  const { openAITutor } = useAITutor();
  const [orderedEntries, setOrderedEntries] = useState(entries);
  const [filter, setFilter] = useState<VocabularyFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("flashcards");
  const [knownState, setKnownState] = useState<KnownState>(initialKnownState);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredEntries = useMemo(() => {
    if (filter === "all") return orderedEntries;
    return orderedEntries.filter((entry) =>
      filter === "known" ? knownState[entry.id] : !knownState[entry.id]
    );
  }, [filter, knownState, orderedEntries]);

  const safeIndex = Math.min(currentIndex, Math.max(filteredEntries.length - 1, 0));
  const currentEntry = filteredEntries[safeIndex];
  const knownCount = orderedEntries.filter((entry) => knownState[entry.id]).length;

  function updateFilter(nextFilter: VocabularyFilter) {
    setFilter(nextFilter);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  function shuffleCurrentList() {
    setOrderedEntries((current) => shuffleEntries(current));
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  function moveTo(index: number) {
    setCurrentIndex(index);
    setIsFlipped(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Controls: View Mode & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        {/* View Mode Toggle (Flashcards vs Danh sách) */}
        <div className="inline-flex rounded-xl bg-[#f1f5f9] p-1 border border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => setViewMode("flashcards")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "flashcards"
                ? "bg-white text-[#2563eb] shadow-2xs"
                : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Flashcards
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "list"
                ? "bg-white text-[#2563eb] shadow-2xs"
                : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Danh sách
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Lọc từ vựng">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === "all"
                ? "bg-[#2563eb] border-[#2563eb] text-white"
                : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]"
            }`}
            onClick={() => updateFilter("all")}
          >
            Tất cả ({entries.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "unknown"}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === "unknown"
                ? "bg-[#2563eb] border-[#2563eb] text-white"
                : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]"
            }`}
            onClick={() => updateFilter("unknown")}
          >
            Chưa nhớ ({entries.length - knownCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "known"}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === "known"
                ? "bg-[#2563eb] border-[#2563eb] text-white"
                : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1]"
            }`}
            onClick={() => updateFilter("known")}
          >
            Đã nhớ ({knownCount})
          </button>
          <button
            type="button"
            onClick={shuffleCurrentList}
            disabled={orderedEntries.length < 2}
            className="px-2.5 py-1.5 rounded-full text-xs font-medium border border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#1e293b] hover:border-[#cbd5e1] transition-all disabled:opacity-40"
            title="Xáo trộn thứ tự từ"
          >
            ⤨
          </button>
        </div>
      </div>

      {viewMode === "flashcards" ? (
        currentEntry ? (
          <div className="space-y-6">
            {/* Card Position Indicator */}
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span className="font-semibold text-[#1e293b]">
                Thẻ {safeIndex + 1} / {filteredEntries.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#ebf2ff] text-[#2563eb] font-semibold text-[11px] border border-blue-100">
                Học theo: Chủ đề
              </span>
            </div>

            {/* Flashcard with Left/Right Navigation Arrows */}
            <div className="relative flex items-center justify-center gap-3 md:gap-6">
              {/* Prev Arrow */}
              <button
                type="button"
                onClick={() => moveTo(Math.max(safeIndex - 1, 0))}
                disabled={safeIndex === 0}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#64748b] hover:text-[#1e293b] flex items-center justify-center font-bold text-lg shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-all"
                aria-label="Thẻ trước"
              >
                ‹
              </button>

              {/* Main Card with 3D Flip */}
              <div
                className="w-full max-w-xl"
                style={{ perspective: "1200px" }}
              >
                <div
                  className="relative w-full min-h-[320px] md:min-h-[350px] cursor-pointer select-none transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                  onClick={() => setIsFlipped((flipped) => !flipped)}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isFlipped
                      ? "Mặt sau thẻ từ vựng. Nhấn để xem mặt trước"
                      : "Mặt trước thẻ từ vựng. Nhấn để xem mặt sau"
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setIsFlipped((flipped) => !flipped);
                    }
                  }}
                >
                  {/* FRONT FACE */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl border border-[#e2e8f0] bg-white p-6 md:p-8 shadow-sm hover:shadow-md flex flex-col justify-between items-center text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(0deg)",
                    }}
                  >
                    {/* Speaker Button on Top-Right */}
                    <button
                      type="button"
                      className="speaker-button absolute top-5 right-5 p-2 rounded-xl text-[#64748b] hover:text-[#2563eb] hover:bg-[#ebf2ff] transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        speakKorean(currentEntry.korean);
                      }}
                      aria-label={`Phát âm ${currentEntry.korean}`}
                      title="Nghe phát âm"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    </button>

                    <div className="my-auto space-y-3 py-4 w-full">
                      <h2
                        id="vocabulary-word"
                        className="text-4xl sm:text-5xl font-extrabold text-[#1e293b] tracking-tight leading-tight"
                      >
                        {currentEntry.korean}
                      </h2>
                      <p className="text-sm font-medium text-[#2563eb]">
                        [{currentEntry.korean}]
                      </p>
                      <p className="text-lg font-semibold text-[#475569]">
                        {currentEntry.meaning}
                      </p>
                      <p className="text-xs text-[#94a3b8] pt-4">
                        (Nhấn vào thẻ để xem chi tiết & ví dụ)
                      </p>
                    </div>

                    <div className="text-[11px] text-[#94a3b8]">
                      Hangul Study · Tiếng Hàn Tổng hợp Sơ cấp 1
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl border border-[#e2e8f0] bg-white p-6 md:p-8 shadow-sm hover:shadow-md flex flex-col justify-between items-center text-left overflow-y-auto"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Speaker Button on Top-Right */}
                    <button
                      type="button"
                      className="speaker-button absolute top-5 right-5 p-2 rounded-xl text-[#64748b] hover:text-[#2563eb] hover:bg-[#ebf2ff] transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        speakKorean(currentEntry.korean);
                      }}
                      aria-label={`Phát âm ${currentEntry.korean}`}
                      title="Nghe phát âm"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    </button>

                    <div className="space-y-4 text-left w-full px-2 my-auto">
                      <div className="border-b border-[#f1f5f9] pb-3">
                        <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2 py-0.5 rounded-md">
                          {currentEntry.partOfSpeech || "Từ vựng"}
                        </span>
                        <h3 className="text-2xl font-bold text-[#1e293b] mt-1">
                          {currentEntry.korean}
                        </h3>
                        <p className="text-sm font-medium text-[#475569] mt-0.5">
                          {currentEntry.meaning}
                        </p>
                      </div>

                      {currentEntry.examples?.[0] && (
                        <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                            Ví dụ
                          </span>
                          <p className="text-sm font-semibold text-[#1e293b]">
                            {currentEntry.examples[0].korean}
                          </p>
                          <p className="text-xs text-[#64748b]">
                            {currentEntry.examples[0].translation}
                          </p>
                        </div>
                      )}

                      {currentEntry.notes && (
                        <p className="text-xs text-[#64748b] italic">
                          Ghi chú: {currentEntry.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] text-[#94a3b8] w-full text-center">
                      (Nhấn để quay lại mặt trước)
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Arrow */}
              <button
                type="button"
                onClick={() => moveTo(Math.min(safeIndex + 1, filteredEntries.length - 1))}
                disabled={safeIndex === filteredEntries.length - 1}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#64748b] hover:text-[#1e293b] flex items-center justify-center font-bold text-lg shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-all"
                aria-label="Thẻ sau"
              >
                ›
              </button>
            </div>

            {/* Bottom Mastery Buttons & AI Button */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {/* Unknown Button */}
              <button
                type="button"
                className={`unknown-button flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  knownState[currentEntry.id] === false
                    ? "bg-red-50 text-red-600 border-red-200 is-selected"
                    : "bg-white text-red-500 border-red-200 hover:bg-red-50"
                }`}
                onClick={async (event) => {
                  event.stopPropagation();
                  const isCurrentlyKnown = knownState[currentEntry.id];
                  if (isCurrentlyKnown === false) return;

                  setKnownState((current) => ({ ...current, [currentEntry.id]: false }));
                  if (lessonContext) {
                    const res = await toggleVocabularyMastery({
                      ...lessonContext,
                      itemId: currentEntry.id,
                      isKnown: false,
                    });
                    if (res && !res.success && res.error !== "Unauthorized") {
                      setKnownState((current) => ({
                        ...current,
                        [currentEntry.id]: isCurrentlyKnown,
                      }));
                    }
                  }
                }}
              >
                ✕ Chưa nhớ
              </button>

              {/* Known Button */}
              <button
                type="button"
                className={`known-button flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  knownState[currentEntry.id] === true
                    ? "bg-[#16a34a] text-white border-[#16a34a] shadow-xs is-selected"
                    : "bg-white text-[#16a34a] border-[#16a34a] hover:bg-green-50"
                }`}
                onClick={async (event) => {
                  event.stopPropagation();
                  const isCurrentlyKnown = knownState[currentEntry.id];
                  if (isCurrentlyKnown === true) return;

                  setKnownState((current) => ({ ...current, [currentEntry.id]: true }));
                  if (lessonContext) {
                    const res = await toggleVocabularyMastery({
                      ...lessonContext,
                      itemId: currentEntry.id,
                      isKnown: true,
                    });
                    if (res && !res.success && res.error !== "Unauthorized") {
                      setKnownState((current) => ({
                        ...current,
                        [currentEntry.id]: isCurrentlyKnown,
                      }));
                    }
                  }
                }}
              >
                ✓ Đã nhớ
              </button>

              {/* AI Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openAITutor({
                    courseId: lessonContext?.courseId ?? "tong-hop",
                    bookId: lessonContext?.bookId ?? "book-01",
                    lessonId: lessonContext?.lessonId ?? "lesson-01",
                    module: "vocabulary",
                    contentId: currentEntry.id,
                  });
                }}
                className="ai-tutor-button flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#ebf2ff] text-[#2563eb] border border-blue-200 hover:bg-[#dbeafe] transition-all"
              >
                ✨ Hỏi AI
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center space-y-3">
            <span className="text-3xl">📚</span>
            <h3 className="font-bold text-[#1e293b]">Chưa có từ nào trong nhóm này.</h3>
            <p className="text-xs text-[#64748b]">Hãy thử chọn bộ lọc khác để tiếp tục học.</p>
          </div>
        )
      ) : (
        /* List View */
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-2xs divide-y divide-[#f1f5f9]">
          {filteredEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#94a3b8] w-6 shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#1e293b]">{entry.korean}</span>
                    <button
                      type="button"
                      onClick={() => speakKorean(entry.korean)}
                      className="p-1 text-[#64748b] hover:text-[#2563eb]"
                      title="Nghe phát âm"
                    >
                      🔊
                    </button>
                    {entry.partOfSpeech && (
                      <span className="text-[10px] text-[#64748b] bg-gray-100 px-1.5 py-0.5 rounded">
                        {entry.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5">{entry.meaning}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                    knownState[entry.id]
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {knownState[entry.id] ? "✓ Đã nhớ" : "Chưa nhớ"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    openAITutor({
                      courseId: lessonContext?.courseId ?? "tong-hop",
                      bookId: lessonContext?.bookId ?? "book-01",
                      lessonId: lessonContext?.lessonId ?? "lesson-01",
                      module: "vocabulary",
                      contentId: entry.id,
                    });
                  }}
                  className="p-1.5 text-xs text-[#2563eb] hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                  title="Hỏi AI"
                >
                  ✨ Hỏi AI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
