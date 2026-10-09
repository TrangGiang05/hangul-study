"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "../../lib/auth-client";

type HomeDashboardProps = {
  initialProgressStats: {
    completedLessons: number;
    totalLessons: number;
  };
};

interface SearchItem {
  id: string;
  title: string;
  category: "Bài học" | "Từ vựng" | "Ngữ pháp" | "Chữ cái" | "Luyện tập" | "AI Tutor";
  snippet: string;
  href: string;
}

const SEARCH_DATA: SearchItem[] = [
  {
    id: "lesson-01",
    title: "Bài 1: Chào hỏi cơ bản · 자기소개",
    category: "Bài học",
    snippet: "Học từ vựng, ngữ pháp và phát âm bài 1 Tiếng Hàn Tổng hợp 1",
    href: "/courses/tong-hop/books/book-01/lessons/lesson-01",
  },
  {
    id: "course-tonghop-1",
    title: "Giáo trình Tiếng Hàn Tổng hợp Sơ cấp 1",
    category: "Bài học",
    snippet: "Toàn bộ danh sách bài học và lộ trình sơ cấp 1",
    href: "/courses/tong-hop",
  },
  {
    id: "alphabet-hangul",
    title: "Bảng chữ cái Hangul (한글)",
    category: "Chữ cái",
    snippet: "Nguyên âm, phụ âm, quy tắc ghép vần và phát âm chuẩn",
    href: "/alphabet",
  },
  {
    id: "vocab-lesson-1",
    title: "Từ vựng Bài 1: Chào hỏi & Xưng hô",
    category: "Từ vựng",
    snippet: "한국 (Hàn Quốc), 베트남 (Việt Nam), 학생 (học sinh), 선생님 (giáo viên)...",
    href: "/vocabulary",
  },
  {
    id: "vocab-overview",
    title: "Kho từ vựng theo chủ đề",
    category: "Từ vựng",
    snippet: "Học từ vựng qua flashcard lật 3D có phát âm audio",
    href: "/vocabulary",
  },
  {
    id: "grammar-imnida",
    title: "Ngữ pháp: 입니다 (Là...)",
    category: "Ngữ pháp",
    snippet: "Đuôi câu khẳng định trang trọng / kính ngữ",
    href: "/grammar",
  },
  {
    id: "grammar-imnikka",
    title: "Ngữ pháp: 입니까? (Là... phải không?)",
    category: "Ngữ pháp",
    snippet: "Đuôi câu nghi vấn, hỏi trang trọng",
    href: "/grammar",
  },
  {
    id: "grammar-eunneun",
    title: "Ngữ pháp: 은/는 (Tiểu từ chủ đề)",
    category: "Ngữ pháp",
    snippet: "Đánh dấu chủ thể hoặc đề tài chính trong câu",
    href: "/grammar",
  },
  {
    id: "practice-quiz",
    title: "Luyện tập: Trắc nghiệm củng cố bài",
    category: "Luyện tập",
    snippet: "Bài tập trắc nghiệm và thử thách từ vựng / ngữ pháp",
    href: "/practice",
  },
  {
    id: "ai-tutor-pengul",
    title: "AI Tutor: Trợ lý luyện nói & giải đáp Pengul",
    category: "AI Tutor",
    snippet: "Hỏi đáp ngữ pháp, tra cứu mẫu câu và luyện hội thoại phản xạ",
    href: "/ai-tutor",
  },
];

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  href: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Chào mừng bạn đến với Hangul Study! 🎉",
    description: "Khám phá Bảng chữ cái hoặc bắt đầu Bài 1 để học những câu giao tiếp tiếng Hàn đầu tiên.",
    time: "Hôm nay",
    unread: true,
    href: "/courses/tong-hop/books/book-01/lessons/lesson-01",
  },
  {
    id: "notif-2",
    title: "Gợi ý học tập hôm nay 💡",
    description: "Hoàn thành 10 từ vựng và 3 cấu trúc ngữ pháp trọng tâm của Bài 1 để củng cố kiến thức.",
    time: "2 giờ trước",
    unread: true,
    href: "/vocabulary",
  },
  {
    id: "notif-3",
    title: "Pengul AI Tutor sẵn sàng ✨",
    description: "Bạn có thắc mắc về cách dùng đuôi câu hoặc ngữ pháp? Hãy hỏi trợ lý Pengul nhé!",
    time: "Hôm qua",
    unread: false,
    href: "/ai-tutor",
  },
];

export function HomeDashboard({ initialProgressStats }: HomeDashboardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SEARCH_DATA.slice(0, 5);
    return SEARCH_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Click outside listener for Search & Notification dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notificationContainerRef.current &&
        !notificationContainerRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredSearchResults.length > 0) {
      e.preventDefault();
      setIsSearchOpen(false);
      router.push(filteredSearchResults[0].href);
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setIsNotificationsOpen(false);
    router.push(item.href);
  };

  const progressPercentage =
    Math.round(
      (initialProgressStats.completedLessons / initialProgressStats.totalLessons) *
        100
    ) || 0;

  const userName = session?.user?.name || "bạn";

  const getCategoryBadgeClass = (category: SearchItem["category"]) => {
    switch (category) {
      case "Bài học":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Từ vựng":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Ngữ pháp":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Chữ cái":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Luyện tập":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "AI Tutor":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header / Search & Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        {/* Search Bar with interactive dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748b]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onClick={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm kiếm bài học, từ vựng, ngữ pháp..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-white border border-[#e2e8f0] rounded-xl focus:border-[#2563eb] focus:ring-2 focus:ring-[#ebf2ff] outline-none transition-all placeholder:text-[#94a3b8]"
            aria-label="Tìm kiếm nội dung học"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#64748b] transition-colors"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search Dropdown Results */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
              <div className="p-2 border-b border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b] bg-[#f8fafc] px-3.5">
                <span className="font-semibold">
                  {searchQuery.trim() ? "Kết quả tìm kiếm" : "Gợi ý nhanh"}
                </span>
                <span className="text-[11px] text-[#94a3b8]">Nhấn Enter để chọn</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#f8fafc] p-1.5">
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-[#f8fafc] transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors truncate">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748b] line-clamp-1">{item.snippet}</p>
                      </div>
                      <span className="text-xs text-[#94a3b8] group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all self-center">
                        →
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs font-semibold text-[#64748b]">
                      Không tìm thấy kết quả phù hợp cho &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-[11px] text-[#94a3b8] mt-1">
                      Thử tìm &ldquo;Bài 1&rdquo;, &ldquo;Từ vựng&rdquo;, &ldquo;Ngữ pháp&rdquo; hoặc &ldquo;Hangul&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Notification Bell with interactive Popover */}
          <div ref={notificationContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 text-[#64748b] hover:text-[#1e293b] hover:bg-white rounded-xl border border-transparent hover:border-[#e2e8f0] transition-colors"
              aria-label="Thông báo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>

              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] z-50 overflow-hidden">
                <div className="p-3.5 border-b border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1e293b]">Thông báo</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold text-[#2563eb] hover:underline"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#f1f5f9] max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className={`w-full text-left p-3.5 hover:bg-[#f8fafc] transition-colors flex items-start gap-3 ${
                        item.unread ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <div
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          item.unread ? "bg-rose-500" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-bold text-[#1e293b] truncate">{item.title}</p>
                          <span className="text-[10px] text-[#94a3b8] shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-[#64748b] leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-2.5 text-center bg-[#f8fafc] border-t border-[#f1f5f9]">
                  <p className="text-[11px] text-[#94a3b8]">
                    Bạn đã cập nhật tất cả thông báo mới nhất
                  </p>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-2.5 p-1.5 pr-3 bg-white rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all"
          >
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
              {/* High contrast, clearly readable button */}
              <Link
                href="/courses/tong-hop/books/book-01/lessons/lesson-01"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:bg-blue-800 transition-all duration-150"
              >
                <span>Tiếp tục học</span>
                <span aria-hidden="true">→</span>
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

            {/* High contrast, clearly readable button */}
            <Link
              href="/courses/tong-hop/books/book-01/lessons/lesson-01"
              className="w-full flex items-center justify-center rounded-xl bg-blue-600 py-3 px-4 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:bg-blue-800 transition-all duration-150"
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