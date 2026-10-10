import Link from "next/link";
import { DashboardLayout } from "../../../components/dashboard/DashboardLayout";
import { CourseViewer } from "../../../components/course/CourseViewer";
import { getCourseFullStats } from "../../../lib/progress";

export default async function CourseTongHopPage() {
  const stats = await getCourseFullStats("tong-hop", "book-01");

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] transition-colors"
        >
          ← Về trang chủ
        </Link>

        <CourseViewer stats={stats} />
      </div>
    </DashboardLayout>
  );
}
