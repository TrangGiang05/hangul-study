"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { GrammarEntry } from "../../lib/content/grammar";
import type { LessonSummary } from "../../lib/content/lesson";
import { useAITutor } from "../ai/AITutorContext";
import { toggleGrammarMastery } from "../../app/actions/grammar";

type LessonContext = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

type GrammarExplorerProps = {
  allEntries: GrammarEntry[];
  availableLessons: LessonSummary[];
  initialLessonId?: string;
  isInvalidLesson?: boolean;
  lessonContext?: LessonContext;
  initialLearnedState?: Record<string, boolean>;
};

type LearnedState = Record<string, boolean>;

function speakKorean(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

// Crisp SVG Icons (All styled in matching blue theme)
function LightbulbIcon({ className = "w-4 h-4 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

function FormulaIcon({ className = "w-4 h-4 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function TableIcon({ className = "w-4 h-4 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      />
    </svg>
  );
}

function BookIcon({ className = "w-4 h-4 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

function ChatIcon({ className = "w-4 h-4 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function SpeakerIcon({ className = "w-4 h-4 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );
}

function HomeIcon({ className = "w-3.5 h-3.5 text-blue-600" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function renderHighlightedSentence(sentence: string, highlightText?: string) {
  if (!highlightText) {
    return <span>{sentence}</span>;
  }
  const parts = sentence.split(highlightText);
  if (parts.length === 1) {
    return <span>{sentence}</span>;
  }
  return (
    <span>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="text-blue-600 font-extrabold mx-0.5">
              {highlightText}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

function renderFormattedNotes(notes: string) {
  if (!notes) return null;
  const bullets = notes.includes("✦")
    ? notes.split("✦").map((s) => s.trim()).filter(Boolean)
    : notes.split(". ").map((s) => (s.trim().endsWith(".") ? s.trim() : `${s.trim()}.`)).filter((s) => s.length > 5);

  if (bullets.length <= 1) {
    return <p className="text-xs text-amber-950 leading-relaxed font-medium">• {notes}</p>;
  }

  return (
    <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
      {bullets.map((bullet, idx) => (
        <li key={idx} className="flex items-start gap-2 leading-relaxed">
          <span className="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
          <span>{bullet.replace(/^✦\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

export function GrammarExplorer({
  allEntries,
  availableLessons,
  initialLessonId,
  isInvalidLesson = false,
  initialLearnedState = {},
}: GrammarExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAITutor } = useAITutor();

  const [selectedLessonOverride, setSelectedLessonOverride] = useState<string | null>(null);
  const selectedLessonId = selectedLessonOverride ?? (initialLessonId || "all");

  const [searchQuery, setSearchQuery] = useState("");
  const [learnedState, setLearnedState] = useState<LearnedState>(initialLearnedState);
  const [selectedId, setSelectedId] = useState<string>(allEntries[0]?.id ?? "");

  function handleLessonChange(lessonId: string) {
    setSelectedLessonOverride(lessonId);

    const params = new URLSearchParams(searchParams.toString());
    if (lessonId === "all") {
      params.delete("lessonId");
    } else {
      params.set("lessonId", lessonId);
    }
    const queryString = params.toString();
    router.push(queryString ? `/grammar?${queryString}` : "/grammar");
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

  // Scope statistics
  const scopeTotal = scopedEntries.length;
  const scopeLearnedCount = scopedEntries.filter((item) => learnedState[item.id] === true).length;
  const scopeProgressPercent =
    scopeTotal > 0 ? Math.round((scopeLearnedCount / scopeTotal) * 100) : 0;

  // 2. Filter by Search Query
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return scopedEntries;

    return scopedEntries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.meaning.toLowerCase().includes(query) ||
        (entry.pattern && entry.pattern.toLowerCase().includes(query)) ||
        (entry.explanation && entry.explanation.toLowerCase().includes(query))
    );
  }, [scopedEntries, searchQuery]);

  // Selected Grammar Point
  const selectedEntry =
    filteredEntries.find((entry) => entry.id === selectedId) ||
    filteredEntries[0] ||
    null;

  const isLearned = selectedEntry ? (learnedState[selectedEntry.id] ?? false) : false;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Search and Scope Filter Bar - Clean Blue Theme */}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài học, từ vựng, ngữ pháp..."
              className="w-full pl-8 pr-8 py-2.5 text-xs md:text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-xl focus:border-[#2563eb] focus:bg-white outline-none transition-all placeholder:text-[#94a3b8]"
              aria-label="Tìm kiếm ngữ pháp"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94a3b8] hover:text-[#64748b]"
                aria-label="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Lesson Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="grammar-lesson-filter-select" className="text-xs font-semibold text-[#64748b] shrink-0">
              Bài học:
            </label>
            <select
              id="grammar-lesson-filter-select"
              value={isInvalidLesson && selectedLessonId === initialLessonId ? initialLessonId : selectedLessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              className="text-xs md:text-sm bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-2 px-3 font-semibold text-[#1e293b] focus:border-[#2563eb] outline-none transition-all cursor-pointer"
            >
              <option value="all">Tất cả bài học</option>
              {availableLessons.map((l) => {
                return (
                  <option key={l.id} value={l.id} disabled={!l.hasContent}>
                    {l.title} {!l.hasContent ? "(Chưa có dữ liệu)" : ""}
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

        {/* Scope Progress Bar - Blue Theme (No Purple) */}
        <div className="pt-2 border-t border-[#f1f5f9] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#64748b]">
          <div className="flex items-center gap-2">
            <span>Tiến độ ngữ pháp phạm vi hiện tại:</span>
          </div>
          <div className="w-full sm:w-48 bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, scopeProgressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: List on Left (4 cols), Detail on Right (8 cols) */}
      {isInvalidLesson && selectedLessonId === initialLessonId ? (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center space-y-4">
          <span className="text-4xl">⚠️</span>
          <h3 className="text-base font-bold text-[#1e293b]">
            Bài học &ldquo;{initialLessonId}&rdquo; không hợp lệ hoặc chưa có dữ liệu.
          </h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            Hệ thống không tự động mở Bài 1. Bạn có thể xóa bộ lọc để tra cứu toàn bộ các điểm ngữ pháp hoặc chọn bài học khác.
          </p>
          <button
            type="button"
            onClick={() => handleLessonChange("all")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all"
          >
            Xem tất cả ngữ pháp
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center space-y-4">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-[#1e293b]">
            {searchQuery
              ? `Không tìm thấy điểm ngữ pháp phù hợp với "${searchQuery}".`
              : "Chưa có dữ liệu ngữ pháp trong nhóm này."}
          </h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            {searchQuery
              ? "Hãy thử tìm theo cấu trúc (ví dụ: 입니다, 입니까, 은/는) hoặc nghĩa tiếng Việt."
              : "Hãy thử đổi bộ lọc hoặc chọn bài học khác."}
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
                Xem tất cả ngữ pháp
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Navigation List (4 cols) - Matching User Mockup */}
          <nav
            className="lg:col-span-4 rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-2xs space-y-3"
            aria-label="Danh sách điểm ngữ pháp"
          >
            {/* Header with Back Arrow and Scope Badge */}
            <div className="space-y-2 border-b border-[#f1f5f9] pb-3">
              <Link
                href="/courses/tong-hop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors"
              >
                <span>←</span> Ngữ pháp
              </Link>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {selectedLessonId === "all"
                    ? "Bài 1: 자기소개 (Chào hỏi cơ bản)"
                    : (availableLessons.find((l) => l.id === selectedLessonId)?.title || "Bài học")}
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                  {scopeLearnedCount}/{scopeTotal} đã học
                </span>
              </div>
            </div>

            {/* List of Grammar Cards */}
            <div className="space-y-2 max-h-[660px] overflow-y-auto pr-0.5">
              {filteredEntries.map((entry, index) => {
                const active = entry.id === selectedEntry?.id;
                const learned = learnedState[entry.id];
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center justify-between gap-3 border cursor-pointer ${active
                        ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                        : "bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/20 text-slate-700"
                      }`}
                    onClick={() => setSelectedId(entry.id)}
                    aria-pressed={active}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Number badge */}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${active
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Title & Subtitle */}
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-sm leading-snug truncate ${active ? "text-blue-900" : "text-slate-800"}`}>
                          {entry.title}
                        </p>
                        <p className={`text-xs mt-0.5 truncate ${active ? "text-blue-600 font-medium" : "text-slate-500"}`}>
                          {(entry.category || entry.meaning)?.replace(/\s*\([Tt]opic\s*[Mm]arker\)/i, "")}
                        </p>
                      </div>
                    </div>

                    {/* Checkbox Icon matching mockup */}
                    <div className="shrink-0">
                      {learned ? (
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-md border border-emerald-400 bg-emerald-50 text-emerald-600 text-xs font-bold shadow-2xs"
                          aria-label="Đã học"
                        >
                          ✓
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded-md border border-slate-200 bg-white"
                          aria-label="Chưa học"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Detail Workspace (8 cols) - Matching Mockup */}
          {selectedEntry && (
            <article
              className="lg:col-span-8 rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-7 shadow-2xs space-y-5"
              aria-live="polite"
              aria-labelledby="grammar-detail-title"
            >
              {/* Top Navigation Row: Breadcrumb & AI Tutor button */}
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#f1f5f9] pb-4">
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                    <HomeIcon /> Ngữ pháp
                  </span>
                  <span className="text-slate-300">›</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                    {selectedEntry.lessonTitle || "Bài 1: 자기소개 (Chào hỏi cơ bản)"}
                  </span>
                  <span className="text-slate-300">›</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-bold shadow-2xs">
                    {selectedEntry.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    openAITutor({
                      courseId: "tong-hop",
                      bookId: "book-01",
                      lessonId: selectedEntry.lessonId,
                      module: "grammar",
                      contentId: selectedEntry.id,
                    });
                  }}
                  className="grammar-ai-button inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-white hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all border border-blue-200 shadow-2xs cursor-pointer !opacity-100 !cursor-pointer"
                >
                  ✨ Hỏi AI Tutor →
                </button>
              </div>

              {/* Title Header: 01 입니다 / Category */}
              <div className="flex items-start gap-3.5">
                <span className="text-2xl font-extrabold text-blue-600 shrink-0 leading-tight">
                  {String(filteredEntries.findIndex((e) => e.id === selectedEntry.id) + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2
                    id="grammar-detail-title"
                    className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-tight"
                  >
                    {selectedEntry.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    {(selectedEntry.category || selectedEntry.meaning)?.replace(/\s*\([Tt]opic\s*[Mm]arker\)/i, "")}
                  </p>
                </div>
              </div>

              {/* BOX 1: 💡 Ý nghĩa & cách dùng */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <LightbulbIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Ý nghĩa &amp; cách dùng
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {selectedEntry.explanation}
                </p>
              </div>

              {/* BOX 2: 📐 Công thức cấu trúc */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FormulaIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Công thức cấu trúc
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  {/* Left Label */}
                  <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 shrink-0 whitespace-nowrap">
                    Cấu trúc
                  </span>

                  {/* Center Formula Box - ALWAYS 1 LINE, NEVER SQUISHED */}
                  <div className="flex-1 text-center py-2.5 px-6 rounded-xl border border-blue-200 bg-blue-50/20 min-w-0">
                    <span className="text-lg sm:text-2xl font-extrabold text-blue-600 tracking-tight whitespace-nowrap inline-block">
                      {selectedEntry.structure || `Danh từ (N) + ${selectedEntry.title}`}
                    </span>
                  </div>

                  {/* Right Note / Tag - Concise and never overflowing */}
                  <div className="text-center sm:text-right shrink-0">
                    <span className="text-[10px] font-semibold text-blue-600 block mb-0.5 whitespace-nowrap">
                      {selectedEntry.rules && selectedEntry.rules.length > 1
                        ? "Phân biệt theo phụ âm cuối (받침)"
                        : "Áp dụng chung"}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-600 shadow-2xs whitespace-nowrap">
                      {selectedEntry.rules && selectedEntry.rules.length > 1
                        ? "+ 은 (받침 O) / + 는 (받침 X)"
                        : selectedEntry.structure || `Danh từ + ${selectedEntry.title}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOX 3: 📋 Quy tắc kết hợp & ví dụ (Table Layout matching Mockup) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Quy tắc kết hợp &amp; ví dụ
                  </h3>
                </div>

                {selectedEntry.rules && selectedEntry.rules.length > 0 ? (
                  <div className="rounded-2xl border border-blue-100 bg-white overflow-hidden shadow-2xs divide-y divide-blue-50">
                    {selectedEntry.rules.map((rule, rIdx) => (
                      <div key={rIdx} className="space-y-1">
                        {/* Table Header: QUY TẮC strictly on 1 single line */}
                        <div className="flex items-center justify-between gap-3 bg-blue-50/50 px-4 py-2.5 text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-extrabold tracking-wide">
                              {rule.patchimBadge === "has_patchim"
                                ? "받침 O"
                                : rule.patchimBadge === "no_patchim"
                                  ? "받침 X"
                                  : "QUY TẮC"}
                            </span>
                            <span className="truncate">{rule.condition}</span>
                          </div>
                          <div className="text-slate-500 font-semibold shrink-0 text-right">
                            Ví dụ
                          </div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-slate-100">
                          {rule.examples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs hover:bg-blue-50/20 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 font-medium min-w-0 flex-wrap">
                                <span className="font-semibold text-slate-700">{ex.stem}</span>
                                <span className="text-slate-400">+</span>
                                <span className="text-blue-600 font-bold">{ex.affix}</span>
                                <span className="text-slate-400">→</span>
                                <span className="font-extrabold text-blue-900">{ex.result}</span>
                              </div>
                              <div className="text-slate-500 italic text-[11px] shrink-0 text-right">
                                {ex.meaning || ex.result}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-blue-50/30 border border-blue-100 text-xs text-blue-700 font-semibold">
                    {selectedEntry.pattern}
                  </div>
                )}
              </div>

              {/* BOX 4: 📖 Bản chất & cách sử dụng */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <BookIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Bản chất &amp; cách sử dụng
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {selectedEntry.explanation}
                </p>
              </div>

              {/* BOX 5: 💬 Ví dụ thực tế & phân tích câu */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChatIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Ví dụ thực tế &amp; phân tích câu
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Bấm 🔊 để nghe phát âm</span>
                </div>

                <div className="space-y-3">
                  {selectedEntry.examples?.map((example, index) => (
                    <div
                      key={`${selectedEntry.id}-example-${index}`}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all space-y-2.5 shadow-2xs"
                    >
                      {/* Sentence + Audio button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                            {renderHighlightedSentence(example.korean, example.highlight)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {example.translation}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => speakKorean(example.korean)}
                          className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer border border-blue-100"
                          title="Nghe phát âm"
                          aria-label={`Nghe phát âm ví dụ ${example.korean}`}
                        >
                          <SpeakerIcon className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>

                      {/* Breakdown Pills */}
                      {example.breakdown && example.breakdown.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Bóc tách:
                          </span>
                          {example.breakdown.map((part, pIdx) => (
                            <span
                              key={pIdx}
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                            >
                              <strong className="text-slate-900 font-bold">{part.part}</strong>
                              <span className="text-slate-500 text-[10px]">({part.role})</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {example.notes && !example.breakdown && (
                        <p className="text-[11px] text-slate-400 italic">({example.notes})</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* BOX 6: 💡 Lưu ý quan trọng */}
              {selectedEntry.notes && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <LightbulbIcon className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Lưu ý quan trọng</span>
                  </div>
                  {renderFormattedNotes(selectedEntry.notes)}
                </div>
              )}

              {/* Bottom Action Button - Clean Blue Theme */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  className={`grammar-learned-button px-6 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${isLearned
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm is-learned hover:bg-blue-700"
                      : "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-2xs"
                    }`}
                  onClick={async () => {
                    const nextIsLearned = !isLearned;

                    setLearnedState((current) => ({
                      ...current,
                      [selectedEntry.id]: nextIsLearned,
                    }));

                    const res = await toggleGrammarMastery({
                      courseId: "tong-hop",
                      bookId: "book-01",
                      lessonId: selectedEntry.lessonId,
                      itemId: selectedEntry.id,
                      isLearned: nextIsLearned,
                    });

                    if (res && !res.success && res.error !== "Unauthorized") {
                      setLearnedState((current) => ({
                        ...current,
                        [selectedEntry.id]: isLearned,
                      }));
                    }
                  }}
                >
                  {isLearned ? "✓ Đã học" : "Đánh dấu đã học"}
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}


