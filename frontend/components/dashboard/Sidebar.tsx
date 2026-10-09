"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "../../lib/auth-client";

const navigationItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Bảng chữ cái", href: "/alphabet", icon: "alphabet" },
  { label: "Học tập", href: "/courses/tong-hop", icon: "course" },
  { label: "Từ vựng", href: "/vocabulary", icon: "book" },
  { label: "Ngữ pháp", href: "/grammar", icon: "grammar" },
  { label: "Luyện tập", href: "/practice", icon: "review" },
  { label: "AI Tutor", href: "/ai-tutor", icon: "sparkle" },
  { label: "Cài đặt", href: "/settings", icon: "settings" },
];

type IconName = (typeof navigationItems)[number]["icon"];

function SidebarIcon({ name }: { name: IconName }) {
  const commonProps = {
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  if (name === "home") {
    return <svg {...commonProps}><path d="m3 10 9-7 9 7" /><path d="M5 9.5V21h14V9.5M9 21v-6h6v6" /></svg>;
  }

  if (name === "alphabet") {
    return <svg {...commonProps}><path d="M4 19 9.5 5h2L17 19M6.2 14h8.6" /><path d="M19 5v14M18 5h2" /></svg>;
  }

  if (name === "course") {
    return <svg {...commonProps}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
  }

  if (name === "book") {
    return <svg {...commonProps}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h7" /></svg>;
  }

  if (name === "grammar") {
    return <svg {...commonProps}><path d="M5 4h14M12 4v16M7 20h10M8 8h2M14 8h2M8 12h2M14 12h2" /></svg>;
  }

  if (name === "review") {
    return <svg {...commonProps}><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5" /></svg>;
  }

  if (name === "sparkle") {
    return <svg {...commonProps}><path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2zM19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6z" /></svg>;
  }

  return <svg {...commonProps}><path d="M12 8.5A3.5 3.5 0 1 0 12 15a3.5 3.5 0 0 0 0-6.5z" /><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.3a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 3.7 12a2 2 0 0 0-.7-1.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2 6.3H9a2 2 0 1 1 4 0v.1a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a2 2 0 0 0 0 4z" /></svg>;
}

type SidebarProps = {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
};

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
          onError: () => {
            setIsLoggingOut(false);
          },
        },
      });
      // Fallback redirect if onSuccess was not called but signOut completed
      router.push("/login");
      router.refresh();
    } catch {
      // error handled safely
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className={`dashboard-sidebar${isOpenMobile ? " is-mobile-open" : ""}`}>
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/" className="sidebar-brand !m-0" aria-label="Về trang chủ Hangul Study" onClick={onCloseMobile}>
          <Image
            src="/assets/brand/logo.png"
            alt="Hangul Study"
            width={40}
            height={40}
            className="h-10 w-10 object-contain rounded-xl"
            priority
          />
          <span>
            <strong>Hangul Study</strong>
            <em>Học tiếng Hàn, từng bước một</em>
          </span>
        </Link>
        {isOpenMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="max-[760px]:block hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Đóng menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="sidebar-section-label">Không gian học</div>
      <nav aria-label="Điều hướng chính" className="sidebar-nav">
        {navigationItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={onCloseMobile}
            >
              <span className="sidebar-link-marker">
                <SidebarIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {isPending ? (
          <div className="text-[#64748b] text-sm py-2">Đang tải...</div>
        ) : session ? (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-2 p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  width={36}
                  height={36}
                  unoptimized
                  className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#ebf2ff] text-[#2563eb] flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1e293b] truncate">{session.user.name}</p>
                <p className="text-xs text-[#64748b] truncate">{session.user.email}</p>
              </div>
            </div>
            <button 
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="text-xs text-[#ef4444] hover:text-[#dc2626] font-medium text-left px-2 py-1 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-2 p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <p className="text-xs font-semibold text-[#1e293b]">Chưa đăng nhập</p>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium py-1.5 px-2 rounded-lg text-center transition-colors shadow-2xs"
                onClick={onCloseMobile}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="flex-1 bg-white hover:bg-gray-50 border border-[#e2e8f0] text-[#1e293b] text-xs font-medium py-1.5 px-2 rounded-lg text-center transition-colors"
                onClick={onCloseMobile}
              >
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}