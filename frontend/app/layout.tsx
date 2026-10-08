import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Hangul Study | Học tiếng Hàn mỗi ngày",
  description: "Không gian học tiếng Hàn dành cho người Việt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans bg-[#f8fafc] text-[#1e293b]">{children}</body>
    </html>
  );
}
