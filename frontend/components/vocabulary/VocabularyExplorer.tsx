"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { VocabularyEntry } from "../../lib/content/vocabulary";
import type { LessonSummary } from "../../lib/content/lesson";
import { useAITutor } from "../ai/AITutorContext";
import { toggleVocabularyMastery } from "../../app/actions/vocabulary";

type VocabularyExplorerProps = {
  allEntries: (VocabularyEntry & { lessonId: string })[];
  availableLessons: LessonSummary[];
  initialLessonId?: string;
  isInvalidLesson?: boolean;
  initialKnownState?: Record<string, boolean>;
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

function shuffleEntries<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export function VocabularyExplorer({
  allEntries,
  availableLessons,
  initialLessonId,
  isInvalidLesson = false,
  initialKnownState = {},
}: VocabularyExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAITutor } = useAITutor();

  // Selected lesson filter: override state or fallback to initialLessonId / "all"
  const [selectedLessonOverride, setSelectedLessonOverride] = useState<string | null>(null);
  const selectedLessonId = selectedLessonOverride ?? (initialLessonId || "all");

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<VocabularyFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("flashcards");
  const [knownState, setKnownState] = useState<KnownState>(initialKnownState);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);

  // Handle lesson filter change and update URL
  function handleLessonChange(lessonId: string) {
    setSelectedLessonOverride(lessonId);
    setCurrentIndex(0);
    setIsFlipped(false);

    const params = new URLSearchParams(searchParams.toString());
    if (lessonId === "all") {
      params.delete("lessonId");
    } else {
      params.set("lessonId", lessonId);
    }
    const queryString = params.toString();
    router.push(queryString ? `/vocabulary?${queryString}` : "/vocabulary");
  }

  // 1. Filter by Lesson Scope
  const scopedEntries = useMemo(() => {
    if (isInvalidLesson && selectedLessonId === initialLessonId) {
      return [];
    }
    if (selectedLessonId === "all") {
      return allEntries;
    }
    return allEntries.filter((item) => item.lessonId === selectedLessonId);
  }, [allEntries, selectedLessonId, initialLessonId, isInvalidLesson]);

  // Scope statistics: reflecting the active scope (all or selected lesson)
  const scopeTotal = scopedEntries.length;
  const scopeKnownCount = scopedEntries.filter((item) => knownState[item.id] === true).length;
  const scopeProgressPercent =
    scopeTotal > 0 ? Math.round((scopeKnownCount / scopeTotal) * 100) : 0;

  // 2. Search & Mastery Filter
  const filteredEntries = useMemo(() => {
    let list = scopedEntries;

    // Search by Korean and Vietnamese meaning
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (entry) =>
          entry.korean.toLowerCase().includes(query) ||
          entry.meaning.toLowerCase().includes(query) ||
          (entry.partOfSpeech && entry.partOfSpeech.toLowerCase().includes(query))
      );
    }

    // Filter by mastery status
    if (filter === "known") {
      list = list.filter((entry) => knownState[entry.id] === true);
    } else if (filter === "unknown") {
      list = list.filter((entry) => knownState[entry.id] !== true);
    }

    // Apply shuffle if active
    if (isShuffled && shuffledOrder.length > 0) {
      const orderMap = new Map(shuffledOrder.map((id, idx) => [id, idx]));
      list = [...list].sort((a, b) => {
        const orderA = orderMap.get(a.id) ?? 999;
        const orderB = orderMap.get(b.id) ?? 999;
        return orderA - orderB;
      });
    }

    return list;
  }, [scopedEntries, searchQuery, filter, knownState, isShuffled, shuffledOrder]);

  const safeIndex = Math.min(currentIndex, Math.max(filteredEntries.length - 1, 0));
  const currentEntry = filteredEntries[safeIndex];

  function toggleShuffle() {
    if (isShuffled) {
      setIsShuffled(false);
      setShuffledOrder([]);
    } else {
      const ids = filteredEntries.map((e) => e.id);
      const shuffled = shuffleEntries(ids);
      setShuffledOrder(shuffled);
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  function moveTo(index: number) {
    setCurrentIndex(index);
    setIsFlipped(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search and Scope Filter Bar */}
      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8] text-xs">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              placeholder="Tìm từ tiếng Hàn hoặc nghĩa tiếng Việt..."
              className="w-full pl-8 pr-8 py-2 text-xs md:text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:border-[#2563eb] focus:bg-white outline-none transition-all placeholder:text-[#94a3b8]"
              aria-label="Tìm kiếm từ vựng"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentIndex(0);
                }}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94a3b8] hover:text-[#64748b]"
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lesson Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="lesson-filter-select" className="text-xs font-semibold text-[#64748b] shrink-0">
              Bài học:
            </label>
            <select
              id="lesson-filter-select"
              value={isInvalidLesson && selectedLessonId === initialLessonId ? initialLessonId : selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="text-xs md:text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-2 px-3 font-semibold text-[#1e293b] focus:border-[#2563eb] outline-none transition-all cursor-pointer"
            >
              <option value="all">Tất cả bài học ({allEntries.length} từ)</option>
              {availableLessons.map((l) => {
                const count = allEntries.filter((item) => item.lessonId === l.id).length;
                return (
                  <option key={l.id} value={l.id} disabled={!l.hasContent}>
                    {l.title} {l.hasContent ? `(${count} từ)` : "(Chưa có dữ liệu)"}
                  </option>
                );
              })}
              {isInvalidLesson && initialLessonId && (
                <option value={initialLessonId} disabled>
                  Bài học không hợp lệ ({initialLessonId})
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Scope Progress Indicator (Section 5.2 & 5.5) */}
        <div className="pt-2 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <span>Tiến độ phạm vi hiện tại:</span>
            <span className="font-bold text-[#1e293b]">
              {scopeKnownCount} / {scopeTotal} từ đã nhớ ({scopeProgressPercent}%)
            </span>
          </div>
          <div className="w-full sm:w-48 bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, scopeProgressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle and Mastery Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        {/* Flashcards vs Danh sách */}
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
            onClick={() => {
              setFilter("all");
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            Tất cả ({scopedEntries.length})
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
            onClick={() => {
              setFilter("unknown");
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            Chưa nhớ ({scopedEntries.length - scopeKnownCount})
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
            onClick={() => {
              setFilter("known");
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
          >
            Đã nhớ ({scopeKnownCount})
          </button>
          <button
            type="button"
            onClick={toggleShuffle}
            disabled={filteredEntries.length < 2}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-40 ${
              isShuffled
                ? "bg-[#ebf2ff] border-[#2563eb] text-[#2563eb] font-bold"
                : "border-[#e2e8f0] bg-white text-[#64748b] hover:text-[#1e293b]"
            }`}
            title="Xáo trộn thứ tự từ"
          >
            ⤨ {isShuffled ? "Đang xáo" : ""}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isInvalidLesson && selectedLessonId === initialLessonId ? (
        /* Empty State: Invalid Lesson */
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center space-y-4">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-base font-bold text-[#1e293b]">
            Bài học &ldquo;{initialLessonId}&rdquo; không hợp lệ hoặc chưa có dữ liệu.
          </h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            Hệ thống không tự động chuyển sang Bài 1. Bạn có thể xóa bộ lọc để tra cứu toàn bộ từ vựng hoặc chọn bài học khác.
          </p>
          <button
            type="button"
            onClick={() => handleLessonChange("all")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            Xem tất cả từ vựng
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        /* Empty State: No search results or no entries matching filter */
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center space-y-4">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-[#1e293b]">
            {searchQuery
              ? `Không tìm thấy từ vựng phù hợp với "${searchQuery}".`
              : "Không có từ vựng nào trong nhóm này."}
          </h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            {searchQuery
              ? "Hãy thử tìm bằng từ tiếng Hàn hoặc nghĩa tiếng Việt khác."
              : "Hãy thử đổi bộ lọc trạng thái hoặc chọn bài học khác."}
          </p>
          <div className="flex items-center justify-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-3.5 py-1.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#1e293b] hover:bg-[#f8fafc]"
              >
                Xóa tìm kiếm
              </button>
            )}
            {selectedLessonId !== "all" && (
              <button
                type="button"
                onClick={() => handleLessonChange("all")}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Xem tất cả từ vựng
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "flashcards" ? (
        /* FLASHCARD VIEW */
        currentEntry && (
          <div className="space-y-6">
            {/* Card Position Indicator */}
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span className="font-semibold text-[#1e293b]">
                Thẻ {safeIndex + 1} / {filteredEntries.length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#ebf2ff] text-[#2563eb] font-semibold text-[11px] border border-blue-100">
                {currentEntry.lessonTitle || "Từ vựng"}
              </span>
            </div>

            {/* Flashcard with Navigation */}
            <div className="relative flex items-center justify-center gap-3 md:gap-6">
              <button
                type="button"
                onClick={() => moveTo(Math.max(safeIndex - 1, 0))}
                disabled={safeIndex === 0}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#64748b] hover:text-[#1e293b] flex items-center justify-center font-bold text-lg shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed shrink-0 transition-all"
                aria-label="Thẻ trước"
              >
                ‹
              </button>

              {/* 3D Flip Card */}
              <div className="w-full max-w-xl" style={{ perspective: "1200px" }}>
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
                  {/* FRONT FACE: KOREAN ONLY */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl border border-[#e2e8f0] bg-white p-6 md:p-8 shadow-sm hover:shadow-md flex flex-col justify-between items-center text-center"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(0deg)",
                    }}
                  >
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

                    <div className="my-auto space-y-4 py-6 w-full">
                      <h2
                        id="vocabulary-word"
                        className="text-5xl sm:text-6xl font-extrabold text-[#1e293b] tracking-tight leading-tight"
                      >
                        {currentEntry.korean}
                      </h2>
                      {currentEntry.practiceHint && (
                        <p className="text-sm font-medium text-[#2563eb]">
                          [{currentEntry.practiceHint}]
                        </p>
                      )}
                      <p className="text-xs text-[#94a3b8] pt-4">
                        (Nhấn vào thẻ để lật mặt sau xem nghĩa &amp; ví dụ)
                      </p>
                    </div>

                    <div className="text-[11px] text-[#94a3b8]">
                      {currentEntry.lessonTitle || "Hangul Study"}
                    </div>
                  </div>

                  {/* BACK FACE: VIETNAMESE MEANING & EXAMPLES */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-3xl border border-[#e2e8f0] bg-white p-6 md:p-8 shadow-sm hover:shadow-md flex flex-col justify-between items-center text-center overflow-y-auto"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
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

                    <div className="space-y-4 text-center w-full px-2 my-auto flex flex-col items-center">
                      <div className="border-b border-[#f1f5f9] pb-4 w-full flex flex-col items-center text-center">
                        <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full inline-block">
                          {currentEntry.partOfSpeech || "Từ vựng"}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-extrabold text-[#1e293b] mt-2 tracking-tight">
                          {currentEntry.korean}
                        </h3>
                        <p className="text-xl md:text-2xl font-bold text-[#2563eb] mt-1 tracking-tight">
                          {currentEntry.meaning}
                        </p>
                      </div>

                      {currentEntry.examples?.[0] && (
                        <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] w-full text-center space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                            Ví dụ
                          </span>
                          <p className="text-base font-semibold text-[#1e293b]">
                            {currentEntry.examples[0].korean}
                          </p>
                          <p className="text-sm font-medium text-[#475569]">
                            {currentEntry.examples[0].translation}
                          </p>
                        </div>
                      )}

                      {currentEntry.notes && (
                        <p className="text-xs text-[#64748b] italic text-center w-full">
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

            {/* Bottom Action Buttons */}
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
                  const res = await toggleVocabularyMastery({
                    courseId: "tong-hop",
                    bookId: "book-01",
                    lessonId: currentEntry.lessonId,
                    itemId: currentEntry.id,
                    isKnown: false,
                  });
                  if (res && !res.success && res.error !== "Unauthorized") {
                    setKnownState((current) => ({
                      ...current,
                      [currentEntry.id]: isCurrentlyKnown,
                    }));
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
                  const res = await toggleVocabularyMastery({
                    courseId: "tong-hop",
                    bookId: "book-01",
                    lessonId: currentEntry.lessonId,
                    itemId: currentEntry.id,
                    isKnown: true,
                  });
                  if (res && !res.success && res.error !== "Unauthorized") {
                    setKnownState((current) => ({
                      ...current,
                      [currentEntry.id]: isCurrentlyKnown,
                    }));
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
                    courseId: "tong-hop",
                    bookId: "book-01",
                    lessonId: currentEntry.lessonId,
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
        )
      ) : (
        /* LIST VIEW */
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
                    {selectedLessonId === "all" && entry.lessonTitle && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {entry.lessonTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-0.5">{entry.meaning}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={async () => {
                    const nextKnown = !knownState[entry.id];
                    setKnownState((curr) => ({ ...curr, [entry.id]: nextKnown }));
                    await toggleVocabularyMastery({
                      courseId: "tong-hop",
                      bookId: "book-01",
                      lessonId: entry.lessonId,
                      itemId: entry.id,
                      isKnown: nextKnown,
                    });
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    knownState[entry.id]
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {knownState[entry.id] ? "✓ Đã nhớ" : "Chưa nhớ"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAITutor({
                      courseId: "tong-hop",
                      bookId: "book-01",
                      lessonId: entry.lessonId,
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
