import Image from "next/image";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { AlphabetExplorer } from "../../components/alphabet/AlphabetExplorer";
import { alphabetCategories, alphabetEntries } from "../../lib/content/alphabet";

export default function AlphabetPage() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e2e8f0] pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative hidden sm:block">
              <Image
                src="/assets/mascot/pengul-teaching-v2.png"
                alt="Pengul hướng dẫn học bảng chữ cái"
                width={80}
                height={80}
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                BƯỚC ĐẦU TIÊN
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">
                Bảng chữ cái
              </h1>
              <p className="text-xs md:text-sm text-[#64748b] mt-1 max-w-2xl">
                Làm quen với những nguyên âm và phụ âm nền tảng để bắt đầu đọc tiếng Hàn tự tin hơn.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#ebf2ff] text-[#2563eb] shrink-0 self-start sm:self-end">
            <strong className="text-2xl font-bold">{alphabetEntries.length}</strong>
            <span className="text-[11px] text-[#475569] leading-tight font-medium">
              chữ cái<br />cơ bản
            </span>
          </div>
        </header>
        <AlphabetExplorer entries={alphabetEntries} categories={alphabetCategories} />
      </div>
    </DashboardLayout>
  );
}