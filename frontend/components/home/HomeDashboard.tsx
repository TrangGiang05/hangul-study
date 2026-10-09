"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "../../lib/auth-client";

type HomeDashboardProps = {
  initialProgressStats: {
    completedLessons: number;
    totalLessons: number;
  };
};

export function HomeDashboard({ initialProgressStats }: HomeDashboardProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const progressPercentage =
    Math.round(
      (initialProgressStats.completedLessons / initialProgressStats.totalLessons) *
        100
    ) || 0;

  const userName = session?.user?.name || "bạn";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header / Search & Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748b]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học, từ vựng, ngữ pháp..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-[#ebf2ff] outline-none transition-all placeholder:text-[#94a3b8]"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            className="p-2 text-[#64748b] hover:text-[#1e293b] hover:bg-white rounded-xl border border-transparent hover:border-[#e2e8f0] transition-colors"
            aria-label="Thông báo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>

          <Link href="/settings" className="flex items-center gap-2.5 p-1.5 pr-3 bg-white rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={userName}
                width={32}
                height={32}
                unoptimized
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#ebf2ff] text-[#2563eb] flex items-center justify-center font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold text-[#1e293b] max-w-[120px] truncate">
              {userName}
            </span>
          </Link>
        </div>
      </div>

      {/* Welcome / Greeting Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ebf2ff] via-[#f0f5ff] to-[#e6efff] border border-[#dbeafe] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            Xin chào, {userName}
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            Mỗi ngày một chút, học tiếng Hàn là một hành trình thú vị! Cùng Pengul tiếp tục nào!
          </p>
        </div>

        <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-32 h-32 sm:w-36 sm:h-36 relative flex items-center justify-center">
            <Image
              src="/assets/mascot/pengul.png"
              alt="Pengul mascot"
              width={160}
              height={160}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </div>
      </section>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Tiến độ khóa học */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Khóa học chính</span>
                <h2 className="text-base font-bold text-[#1e293b] mt-0.5">Tiến độ khóa học</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Đang học
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-[#1e293b]">Tiếng Hàn Tổng hợp Sơ cấp 1</h3>
                <p className="text-xs text-[#64748b] mt-0.5">Bài 1. Chào hỏi cơ bản · 자기소개</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium text-[#64748b]">
                  <span>Hoàn thành bài học</span>
                  <span className="font-bold text-[#1e293b]">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(progressPercentage, 8)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/courses/tong-hop/books/book-01/lessons/lesson-01"
                className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition-colors"
              >
                Tiếp tục học →
              </Link>
              <Link
                href="/courses/tong-hop"
                className="text-xs font-medium text-[#2563eb] hover:underline"
              >
                Xem chi tiết giáo trình
              </Link>
            </div>
          </div>

          {/* Card: Các chức năng khác */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#1e293b]">Các chức năng khác</h2>
            <div className="grid grid-cols-2 gap-3.5">
              <Link
                href="/vocabulary"
                className="group p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex flex-col gap-2"
              >
                <span className="w-9 h-9 rounded-lg bg-blue-100 text-[#2563eb] flex items-center justify-center text-lg">
                  📖
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                    Từ vựng
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Mở từ vựng theo chủ đề</p>
                </div>
              </Link>

              <Link
                href="/grammar"
                className="group p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex flex-col gap-2"
              >
                <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-lg">
                  📐
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                    Ngữ pháp
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Hiểu và áp dụng ngữ pháp</p>
                </div>
              </Link>

              <Link
                href="/practice"
                className="group p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex flex-col gap-2"
              >
                <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                  ✏️
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                    Luyện tập
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Củng cố kiến thức đã học</p>
                </div>
              </Link>

              <Link
                href="/ai-tutor"
                className="group p-4 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex flex-col gap-2"
              >
                <span className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
                  ✨
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                    AI Tutor
                  </h3>
                  <p className="text-xs text-[#64748b] mt-0.5">Hỏi đáp, luyện nói thông minh</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Hôm nay nên học */}
          <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-2xs space-y-5">
            <h2 className="text-base font-bold text-[#1e293b]">Hôm nay nên học</h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ebf2ff] text-xs font-bold text-[#2563eb]">
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1e293b]">Bài 1: Chào hỏi cơ bản</p>
                  <p className="text-[11px] text-[#64748b]">Tiếng Hàn Tổng hợp Sơ cấp 1</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-xs font-bold text-amber-600">
                  2
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1e293b]">10 từ vựng mới</p>
                  <p className="text-[11px] text-[#64748b]">Chào hỏi và đại từ xưng hô</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-50 text-xs font-bold text-purple-600">
                  3
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1e293b]">Ngữ pháp: 입니다 / 입니까?</p>
                  <p className="text-[11px] text-[#64748b]">Đuôi câu khẳng định &amp; nghi vấn trang trọng</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-600">
                  4
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#1e293b]">Luyện tập: 5 câu</p>
                  <p className="text-[11px] text-[#64748b]">Trắc nghiệm củng cố bài</p>
                </div>
              </div>
            </div>

            <Link
              href="/courses/tong-hop/books/book-01/lessons/lesson-01"
              className="w-full flex items-center justify-center rounded-xl bg-[#2563eb] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition-colors"
            >
              Bắt đầu học
            </Link>
          </div>

          {/* Card: Có lời nhắc */}
          <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-5 shadow-2xs flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
              <Image
                src="/assets/mascot/pengul.png"
                alt="Pengul cổ vũ"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Có lời nhắc</span>
              <p className="text-xs font-bold text-[#1e293b] leading-snug">
                Mỗi ngày kiên trì là một thành công!
              </p>
              <p className="text-[11px] text-[#78350f]">Pengul luôn đồng hành cùng bạn trên từng trang sách.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}