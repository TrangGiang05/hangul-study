"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Trang chủ", href: "/", icon: "home" },
  { label: "Bảng chữ cái", href: "/alphabet", icon: "alphabet" },
  { label: "Từ vựng", href: "/vocabulary", icon: "book" },
  { label: "Ngữ pháp", href: "/grammar", icon: "grammar" },
  { label: "Ôn tập", href: "/review", icon: "review" },
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
    strokeWidth: 1.7,
    viewBox: "0 0 24 24",
  };

  if (name === "home") {
    return <svg {...commonProps}><path d="m3 10 9-7 9 7" /><path d="M5 9.5V21h14V9.5M9 21v-6h6v6" /></svg>;
  }

  if (name === "alphabet") {
    return <svg {...commonProps}><path d="M4 19 9.5 5h2L17 19M6.2 14h8.6" /><path d="M19 5v14M18 5h2" /></svg>;
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <Link href="/" className="sidebar-brand" aria-label="Về trang chủ Hangul Study">
        <Image
          src="/assets/brand/logo.png"
          alt="Hangul Study"
          width={1280}
          height={1280}
          className="h-16 w-16 object-contain"
          priority
        />
        <span>
          <strong>Hangul</strong>
          <em>Study</em>
        </span>
      </Link>

      <div className="sidebar-section-label">Không gian học</div>
      <nav aria-label="Điều hướng chính" className="sidebar-nav">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link${(item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ? " is-active" : ""}`}
            aria-current={(item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) ? "page" : undefined}
          >
            <span className="sidebar-link-marker">
              <SidebarIcon name={item.icon} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-mark">HS</div>
        <div>
          <p>Học đều mỗi ngày</p>
          <span>Tiến bộ từ những bước nhỏ.</span>
        </div>
      </div>
    </aside>
  );
}