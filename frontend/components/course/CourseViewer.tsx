"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CourseFullStats, LessonProgressStatus } from "../../lib/progress";

type CourseViewerProps = {
  stats: CourseFullStats;
};

export function CourseViewer({ stats }: CourseViewerProps) {
  const [activeTab, setActiveTab] = useState<"lessons" | "progress">("lessons");

  const coursePercent = stats.courseProgress.percent;
  const lesson01Detail = stats.lessonsDetail.find((l) => l.lessonId === "lesson-01");
  const lesson01Status = lesson01Detail?.status || "not_started";

  const getStatusBadge = (status: LessonProgressStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Đã hoàn thành
          </span>
        );
      case "in_progress":
        return (
          <span className="text-[11px] font-semibold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Đang học
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-[#64748b] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#e2e8f0]">
            Chưa học
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Course Progress */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
            Giáo trình chính
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
            Tiếng Hàn Tổng hợp Sơ cấp 1
          </h1>
          <p className="text-xs md:text-sm text-[#64748b] mt-1.5 max-w-2xl">
            Quyển 1: Khởi động &amp; Giao tiếp cơ bản dành cho người Việt bắt đầu từ con số 0.
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-medium text-[#64748b]">
            <span>Tiến độ khóa học</span>
            <span className="font-bold text-[#1e293b]">{coursePercent}%</span>
          </div>
          <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, coursePercent))}%` }}
            />
          </div>
          <p className="text-[11px] text-[#94a3b8] text-right">
            {stats.courseProgress.completedLessons} / {stats.courseProgress.totalLessons} bài hoàn thành
          </p>
        </div>
      </div>

      {/* Main Grid: Left Tabs & Content (7 cols), Right Book Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("lessons")}
              className={`px-3.5 py-1.5 text-xs font-bold transition-colors -mb-2 ${activeTab === "lessons"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-[#64748b] hover:text-[#1e293b]"
                }`}
            >
              Danh sách bài học
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("progress")}
              className={`px-3.5 py-1.5 text-xs font-bold transition-colors -mb-2 ${activeTab === "progress"
                ? "text-[#2563eb] border-b-2 border-[#2563eb]"
                : "text-[#64748b] hover:text-[#1e293b]"
                }`}
            >
              Tiến độ chi tiết
            </button>
          </div>

          {activeTab === "lessons" ? (
            /* TAB: Danh sách bài học */
            <div className="space-y-3 pt-2">
              {stats.lessonsDetail.map((lesson) => {
                if (lesson.hasContent) {
                  return (
                    <Link
                      key={lesson.lessonId}
                      href={`/courses/tong-hop/books/book-01/lessons/${lesson.lessonId}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border-2 border-[#2563eb] bg-[#ebf2ff]/40 shadow-2xs hover:bg-[#ebf2ff]/70 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-xs font-bold text-white shadow-2xs">
                          {String(lesson.order).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-[#1e293b] group-hover:text-[#2563eb] transition-colors truncate">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-[#64748b] mt-0.5 truncate">
                            {lesson.sub}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-100">
                        {/* Per-lesson progress bar & percentage */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1e293b]">
                            {lesson.overallPercent}%
                          </span>
                          <div className="w-16 sm:w-20 bg-white h-2 rounded-full overflow-hidden border border-blue-200">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${lesson.status === "completed" ? "bg-emerald-600" : "bg-[#2563eb]"
                                }`}
                              style={{ width: `${Math.min(100, Math.max(0, lesson.overallPercent))}%` }}
                            />
                          </div>
                        </div>

                        {getStatusBadge(lesson.status)}
                      </div>
                    </Link>
                  );
                }

                return (
                  <div
                    key={lesson.lessonId}
                    className="flex items-center justify-between p-4 rounded-2xl border border-[#e2e8f0] bg-white transition-all gap-3 opacity-75"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-xs font-bold text-[#64748b]">
                        {String(lesson.order).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-[#334155] truncate">{lesson.title}</h3>
                        <p className="text-xs text-[#94a3b8] mt-0.5 truncate">{lesson.sub}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-[#94a3b8] bg-[#f8fafc] px-2.5 py-1 rounded-full border border-[#e2e8f0] shrink-0">
                      Chưa học
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TAB: Tiến độ chi tiết */
            <div className="space-y-5 pt-2">
              {/* Card 1: Tổng quan tiến độ khóa học */}
              <div className="p-5 rounded-2xl border border-[#e2e8f0] bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                    Tiến độ toàn khóa học
                  </span>
                  <span className="text-xs font-bold text-[#1e293b]">
                    {stats.courseProgress.completedLessons} / {stats.courseProgress.totalLessons} bài hoàn thành ({coursePercent}%)
                  </span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, coursePercent))}%` }}
                  />
                </div>
              </div>

              {/* Card 2: Bảng chi tiết từng bài học */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 flex-wrap gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1e293b]">
                    Chi tiết tiến độ từng bài học
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748b]">
                    Công thức: 50% Từ vựng + 50% Ngữ pháp
                  </span>
                </div>

                <div className="space-y-3">
                  {stats.lessonsDetail.map((lesson) => (
                    <div
                      key={lesson.lessonId}
                      className="p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-3">
                        <div>
                          <h3 className="font-bold text-sm text-[#1e293b]">{lesson.title}</h3>
                          <p className="text-xs text-[#64748b]">{lesson.sub}</p>
                        </div>
                        <div className="self-start sm:self-center">
                          {getStatusBadge(lesson.status)}
                        </div>
                      </div>

                      {lesson.hasContent ? (
                        <div className="space-y-2.5">
                          {/* Overall lesson progress */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-[#1e293b]">
                              <span>Tiến độ tổng thể bài:</span>
                              <span>{lesson.overallPercent}%</span>
                            </div>
                            <div className="w-full bg-[#f1f5f9] h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${lesson.status === "completed" ? "bg-emerald-600" : "bg-[#2563eb]"
                                  }`}
                                style={{ width: `${Math.min(100, Math.max(0, lesson.overallPercent))}%` }}
                              />
                            </div>
                          </div>

                          {/* Components Breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Vocab Component */}
                            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-emerald-700">1. Từ vựng</span>
                                <span className="font-bold text-[#1e293b]">
                                  {lesson.vocab.mastered}/{lesson.vocab.total} ({lesson.vocab.percent}%)
                                </span>
                              </div>
                              <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-emerald-100">
                                <div
                                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, lesson.vocab.percent))}%` }}
                                />
                              </div>
                            </div>

                            {/* Grammar Component */}
                            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-purple-700">2. Ngữ pháp</span>
                                <span className="font-bold text-[#1e293b]">
                                  {lesson.grammar.learned}/{lesson.grammar.total} ({lesson.grammar.percent}%)
                                </span>
                              </div>
                              <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-purple-100">
                                <div
                                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, lesson.grammar.percent))}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#94a3b8] italic">
                          Bài học đang chuẩn bị nội dung theo lộ trình giáo trình.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Thống kê luyện tập (Độc lập) */}
              <div className="p-5 rounded-2xl border border-[#e2e8f0] bg-white shadow-2xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
                  Thống kê luyện tập (Độc lập)
                </span>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <span className="text-[11px] font-semibold text-[#64748b] block">
                      Số câu đã làm
                    </span>
                    <span className="text-xl font-extrabold text-[#1e293b] mt-0.5 block">
                      {stats.practice.totalQuestionsAttempted} câu
                    </span>
                    <span className="text-[10px] text-[#94a3b8]">
                      {stats.practice.attemptsCount} lượt làm bài
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <span className="text-[11px] font-semibold text-[#64748b] block">
                      Tỷ lệ trả lời đúng
                    </span>
                    <span className="text-xl font-extrabold text-[#1e293b] mt-0.5 block">
                      {stats.practice.hasData ? `${stats.practice.accuracyRate}%` : "Chưa có dữ liệu"}
                    </span>
                    <span className="text-[10px] text-[#94a3b8]">
                      {stats.practice.hasData
                        ? `${stats.practice.correctAnswersCount}/${stats.practice.totalQuestionsAttempted} câu đúng`
                        : "Làm bài để ghi nhận"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Book Cover & Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-2xs space-y-4">
            {/* Book Cover Container: Portrait Aspect Ratio without cropping */}
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 flex items-center justify-center">
              <div className="relative w-full max-w-[210px] aspect-[495/675] rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/assets/course/tong-hop-so-cap-1-book-01-cover.png"
                  alt="Bìa sách Tiếng Hàn Tổng hợp Sơ cấp 1 - Quyển 1"
                  fill
                  sizes="(max-width: 768px) 210px, 210px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563eb]">
                Giáo trình · Quyển 1
              </span>
              <h2 className="text-lg font-bold text-[#1e293b]">
                Tiếng Hàn Tổng hợp Sơ cấp 1
              </h2>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Bài 1: Chào hỏi cơ bản · Giới thiệu bản thân, những câu giao tiếp căn bản trong cuộc sống hàng ngày.
              </p>
            </div>

            <Link
              href="/courses/tong-hop/books/book-01/lessons/lesson-01"
              className="w-full flex items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold !text-white text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:bg-blue-800 transition-all"
              style={{ color: "#ffffff" }}
            >
              <span style={{ color: "#ffffff" }}>
                {lesson01Status === "completed"
                  ? "Ôn tập lại Bài 1 →"
                  : lesson01Status === "in_progress"
                    ? "Tiếp tục học Bài 1 →"
                    : "Bắt đầu học Bài 1 →"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
