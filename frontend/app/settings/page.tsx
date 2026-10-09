"use client";

import { useState } from "react";
import { useSession, signOut } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
          onError: (ctx) => {
            setLogoutError(ctx.error.message || "Đăng xuất thất bại. Vui lòng thử lại.");
            setIsLoggingOut(false);
          },
        },
      });
      // Fallback redirect if onSuccess was not called but signOut completed
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("Đăng xuất thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight">Cài đặt</h1>
          <p className="text-sm text-[#64748b] mt-1.5">
            Quản lý tài khoản và tùy chỉnh trải nghiệm học tập
          </p>
        </div>

        {/* Account Section */}
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h2 className="text-lg font-bold text-[#1e293b]">Thông tin tài khoản</h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Tài khoản lưu trữ tiến độ từ vựng, ngữ pháp, bài học và lịch sử AI Tutor
            </p>
          </div>

          {isPending ? (
            <div className="py-4 text-sm text-[#64748b]">Đang tải thông tin tài khoản...</div>
          ) : session?.user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f8fafc] p-4 border border-[#e2e8f0]">
                  <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Tên người dùng</span>
                  <p className="text-base font-bold text-[#1e293b] mt-1">
                    {session.user.name || "Học viên"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-4 border border-[#e2e8f0]">
                  <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">Email</span>
                  <p className="text-base font-bold text-[#1e293b] mt-1">{session.user.email}</p>
                </div>
              </div>

              {logoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
                  {logoutError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#64748b]">
                  Phiên đăng nhập đang hoạt động
                </span>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleSignOut}
                  className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 text-sm font-semibold transition-colors border border-red-100 cursor-pointer disabled:opacity-50"
                >
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <span>⚠️ Bạn đang sử dụng tài khoản Khách</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Tiến độ học tập hiện tại chỉ được lưu tạm thời trên trình duyệt này. Hãy đăng ký tài khoản miễn phí để lưu trữ vĩnh viễn tiến độ học trên mọi thiết bị.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/login"
                  className="rounded-xl bg-[#2563eb] text-white px-4 py-2 text-xs font-semibold hover:bg-[#1d4ed8] transition-colors shadow-2xs"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-2xs"
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Preferences Section */}
        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#e2e8f0] pb-4">
            <h2 className="text-lg font-bold text-[#1e293b]">Tùy chọn học tập</h2>
            <p className="text-xs text-[#64748b] mt-0.5">Cấu hình ngôn ngữ và tài liệu học tập mặc định</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-[#1e293b]">Ngôn ngữ hiển thị</p>
                <p className="text-xs text-[#64748b]">Ngôn ngữ giao diện người dùng</p>
              </div>
              <span className="text-xs font-semibold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Tiếng Việt (Mặc định)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-[#1e293b]">Giáo trình đang học</p>
                <p className="text-xs text-[#64748b]">Tài liệu học tập tích hợp cho bài học và AI Tutor</p>
              </div>
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                Tiếng Hàn Tổng hợp Sơ cấp 1
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-[#1e293b]">Trợ lý học tập AI Tutor</p>
                <p className="text-xs text-[#64748b]">Tích hợp giải đáp thắc mắc ngữ cảnh bài học</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Đang bật
              </span>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
