"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { AITutorProvider } from "../ai/AITutorContext";
import { AITutorDrawer } from "../ai/AITutorDrawer";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AITutorProvider>
      {/* Mobile Top Navbar */}
      <div className="max-[760px]:flex hidden sticky top-0 z-30 items-center justify-between bg-white border-b border-[#e2e8f0] px-4 py-2.5">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/brand/logo.png"
            alt="Hangul Study"
            width={32}
            height={32}
            className="h-8 w-8 object-contain rounded-lg"
          />
          <span className="font-extrabold text-[#1e293b] text-base tracking-tight">
            Hangul<span className="text-[#2563eb]">Study</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e293b] transition-colors"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="dashboard-shell">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 max-[760px]:block hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <Sidebar isOpenMobile={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <main className="dashboard-main min-w-0 flex-1">{children}</main>
        <AITutorDrawer />
      </div>
    </AITutorProvider>
  );
}