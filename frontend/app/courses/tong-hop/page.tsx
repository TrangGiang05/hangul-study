import Link from "next/link";
import Image from "next/image";
import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import { getLessonProgressStats } from "../../../lib/progress";

export default async function CourseTongHopPage() {
  const stats = await getLessonProgressStats();
  const progressPercent = Math.round((stats.completedLessons / stats.totalLessons) * 100) || 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] transition-colors"
          >
            ← Về trang chủ
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">Khóa học</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
                Tiếng Hàn Tổng hợp Sơ cấp 1
              </h1>
              <p className="text-xs md:text-sm text-[#64748b] mt-1.5 max-w-2xl">
                Quyển 1: Khởi động & Giao tiếp cơ bản dành cho người Việt bắt đầu từ con số 0.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-xs font-medium text-[#64748b]">
                <span>Tiến độ tổng quan</span>
                <span className="font-bold text-[#1e293b]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2563eb] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercent, 10)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Course Composition Grid: Left Lesson List, Right Preview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Lesson Tabs & List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-bold text-[#2563eb] border-b-2 border-[#2563eb] -mb-2"
              >
                Danh sách bài học
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#1e293b] transition-colors"
              >
                Tiến độ
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {/* Lesson 01 - Active */}
              <Link
                href="/courses/tong-hop/books/book-01/lessons/lesson-01"
                className="group flex items-center justify-between p-4 rounded-2xl border-2 border-[#2563eb] bg-[#ebf2ff]/40 shadow-2xs hover:bg-[#ebf2ff]/70 transition-all gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563eb] text-xs font-bold text-white shadow-2xs">
                    01
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#1e293b] group-hover:text-[#2563eb] transition-colors truncate">
                      Bài 1: 자기소개 (Chào hỏi cơ bản)
                    </h3>
                    <p className="text-xs text-[#64748b] mt-0.5 truncate">
                      25 từ vựng căn bản · Ngữ pháp です / ですか
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-[#2563eb] bg-white px-2.5 py-1 rounded-full border border-blue-200">
                    Đang học
                  </span>
                </div>
              </Link>

              {/* Upcoming Lessons */}
              {[
                { id: "02", title: "Bài 2: 학교 (Trường học)", sub: "Từ vựng đồ dùng học tập, địa điểm" },
                { id: "03", title: "Bài 3: 일상생활 (Sinh hoạt hàng ngày)", sub: "Động từ hành động, thời gian" },
                { id: "04", title: "Bài 4: 날짜와 요일 (Ngày và thứ)", sub: "Số đếm thuần Hàn, Hán Hàn" },
                { id: "05", title: "Bài 5: 하루 일과 (Một ngày của tôi)", sub: "Miêu tả lịch trình, hoạt động" },
              ].map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#cbd5e1] transition-all gap-3 opacity-80"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-xs font-bold text-[#64748b]">
                      {lesson.id}
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
              ))}
            </div>
          </div>

          {/* Right Column: Lesson Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-2xs space-y-4">
              <div className="rounded-xl overflow-hidden border border-[#e2e8f0] aspect-video bg-[#f8fafc] relative flex items-center justify-center">
                <Image
                  src="/assets/course/tong-hop-so-cap-1-book-01-cover.png"
                  alt="Khóa học"
                  width={320}
                  height={180}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563eb]">
                  Bài 1
                </span>
                <h2 className="text-lg font-bold text-[#1e293b]">Chào hỏi cơ bản</h2>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Mục tiêu bài học: Giới thiệu bản thân, những câu giao tiếp cơ bản trong cuộc sống hàng ngày.
                </p>
              </div>

              <Link
                href="/courses/tong-hop/books/book-01/lessons/lesson-01"
                className="w-full flex items-center justify-center rounded-xl bg-[#2563eb] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1d4ed8] transition-colors"
              >
                Tiếp tục học →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
