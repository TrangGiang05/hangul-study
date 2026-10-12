import Link from "next/link";
import Image from "next/image";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
        <div className="w-36 h-36 relative flex items-center justify-center">
          <Image
            src="/assets/mascot/pengul-surprised-v2.png"
            alt="Pengul bất ngờ - 404"
            width={140}
            height={140}
            className="object-contain drop-shadow-md"
            priority
          />
        </div>
        <div className="space-y-2 max-w-md">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
            LỖI 404 · TRANG KHÔNG TỒN TẠI
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b]">
            Ối! Trang này không tìm thấy rồi
          </h1>
          <p className="text-sm text-[#64748b]">
            Trang bạn đang tìm kiếm có thể đã bị di chuyển hoặc không tồn tại. Đừng lo, Pengul sẽ dẫn bạn về nhà nhé!
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-bold shadow-sm hover:bg-[#1d4ed8] transition-all"
        >
          ← Về trang chủ Hangul Study
        </Link>
      </div>
    </DashboardLayout>
  );
}
