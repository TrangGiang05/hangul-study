"use client";

import { useSession, signOut } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1d2942]">Cài đặt</h1>
          <p className="text-sm text-[#7f8ba1] mt-1.5">
            Quản lý tài khoản và tùy chỉnh trải nghiệm học tập
          </p>
        </div>

        {/* Account Section */}
        <section className="rounded-2xl border border-[#e5e9f1] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#e5e9f1] pb-4">
            <h2 className="text-lg font-bold text-[#1d2942]">Thông tin tài khoản</h2>
            <p className="text-xs text-[#7f8ba1] mt-0.5">
              Tài khoản lưu trữ tiến độ từ vựng, ngữ pháp, bài học và lịch sử AI Tutor
            </p>
          </div>

          {isPending ? (
            <div className="py-4 text-sm text-[#7f8ba1]">Đang tải thông tin tài khoản...</div>
          ) : session?.user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#f8f9fc] p-4 border border-[#e5e9f1]">
                  <span className="text-xs font-medium text-[#7f8ba1]">Tên người dùng</span>
                  <p className="text-base font-semibold text-[#1d2942] mt-1">
                    {session.user.name || "Học viên"}
                  </p>
                </div>
                <div className="rounded-xl bg-[#f8f9fc] p-4 border border-[#e5e9f1]">
                  <span className="text-xs font-medium text-[#7f8ba1]">Email</span>
                  <p className="text-base font-semibold text-[#1d2942] mt-1">{session.user.email}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#7f8ba1]">
                  Phiên đăng nhập đang hoạt động
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 text-sm font-medium transition-colors border border-red-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                <span>⚠️ Bạn đang sử dụng tài khoản Khách</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                Tiến độ học tập hiện tại chỉ được lưu tạm thời trên trình duyệt này. Hãy đăng ký tài khoản miễn phí để lưu trữ vĩnh viễn tiến độ học trên mọi thiết bị.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href="/login"
                  className="rounded-lg bg-[#2455a4] text-white px-4 py-2 text-xs font-semibold hover:bg-[#1d4689] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Preferences Section */}
        <section className="rounded-2xl border border-[#e5e9f1] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#e5e9f1] pb-4">
            <h2 className="text-lg font-bold text-[#1d2942]">Tùy chọn học tập</h2>
            <p className="text-xs text-[#7f8ba1] mt-0.5">Cấu hình ngôn ngữ và tài liệu học tập mặc định</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-[#1d2942]">Ngôn ngữ hiển thị</p>
                <p className="text-xs text-[#7f8ba1]">Ngôn ngữ giao diện người dùng</p>
              </div>
              <span className="text-xs font-medium text-[#2455a4] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Tiếng Việt (Mặc định)
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div>
                <p className="text-sm font-semibold text-[#1d2942]">Giáo trình đang học</p>
                <p className="text-xs text-[#7f8ba1]">Tài liệu học tập tích hợp cho bài học và AI Tutor</p>
              </div>
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md">
                Tiếng Hàn Tổng hợp Sơ cấp 1
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-[#1d2942]">Trợ lý học tập AI Tutor</p>
                <p className="text-xs text-[#7f8ba1]">Tích hợp giải đáp thắc mắc ngữ cảnh bài học</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                Đang bật
              </span>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
