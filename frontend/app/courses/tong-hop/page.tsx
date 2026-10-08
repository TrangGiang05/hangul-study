import Link from "next/link";
import Image from "next/image";
import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";

export default function CourseTongHopPage() {
  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#7f8ba1] hover:text-[#2455a4] mb-3 transition-colors">
            ← Về trang chủ
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2455a4]">Giáo trình chính</p>
              <h1 className="text-3xl font-bold text-[#1d2942] mt-1">Tiếng Hàn Tổng hợp Sơ cấp 1</h1>
              <p className="text-sm text-[#7f8ba1] mt-1.5">
                Giáo trình chuẩn dành cho người Việt bắt đầu học tiếng Hàn từ con số 0.
              </p>
            </div>
            <Link
              href="/courses/tong-hop/books/book-01/lessons/lesson-01"
              className="inline-flex items-center justify-center rounded-xl bg-[#2455a4] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#1d4689] transition-colors"
            >
              Học Bài 1: 자기소개 →
            </Link>
          </div>
        </div>

        {/* Book Overview Card */}
        <div className="rounded-2xl border border-[#e5e9f1] bg-white p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start">
          <div className="w-32 h-44 shrink-0 rounded-xl overflow-hidden border border-[#e5e9f1] bg-[#f8f9fc] flex items-center justify-center">
            <Image
              src="/assets/course/tong-hop-so-cap-1-book-01-cover.png"
              alt="Bìa giáo trình Tiếng Hàn Tổng hợp Sơ cấp 1"
              width={128}
              height={176}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                Quyển 1
              </span>
              <span className="text-xs text-[#7f8ba1]">15 bài học</span>
            </div>
            <h2 className="text-xl font-bold text-[#1d2942]">Quyển 1: Khởi động & Giao tiếp cơ bản</h2>
            <p className="text-sm text-[#5a6a85] leading-relaxed">
              Trang bị toàn bộ nền tảng nhập môn: từ bảng chữ cái Hangul, cách chào hỏi, giới thiệu bản thân, trường học, gia đình cho đến hoạt động thường ngày.
            </p>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1d2942]">Danh sách bài học</h2>

          <div className="grid gap-3">
            {/* Lesson 01 - Active */}
            <Link
              href="/courses/tong-hop/books/book-01/lessons/lesson-01"
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#e5e9f1] bg-white hover:border-[#2455a4] hover:shadow-xs transition-all gap-3"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-[#2455a4]">
                  01
                </span>
                <div>
                  <h3 className="font-semibold text-[#1d2942] group-hover:text-[#2455a4] transition-colors">
                    Bài 1: 자기소개 (Giới thiệu bản thân)
                  </h3>
                  <p className="text-xs text-[#7f8ba1] mt-0.5">
                    Học 25 từ vựng căn bản và 2 điểm ngữ pháp 입니다 / 입니까?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  Sẵn sàng học
                </span>
                <span className="text-[#2455a4] text-sm font-semibold">Bắt đầu →</span>
              </div>
            </Link>

            {/* Upcoming Lessons placeholders */}
            {[
              { id: "02", title: "Bài 2: 학교 (Trường học)" },
              { id: "03", title: "Bài 3: 일상생활 (Sinh hoạt hàng ngày)" },
              { id: "04", title: "Bài 4: 날짜 và 요일 (Ngày và thứ)" },
            ].map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#e5e9f1] bg-gray-50/50 opacity-60"
              >
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                    {lesson.id}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-700">{lesson.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Nội dung tiếp theo trong giáo trình</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  Sắp ra mắt
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
