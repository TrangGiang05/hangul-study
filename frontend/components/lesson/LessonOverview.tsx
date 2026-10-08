import Link from "next/link";

type LessonOverviewProps = {
  vocabularyCount: number;
  grammarCount: number;
};

export function LessonOverview({ vocabularyCount, grammarCount }: LessonOverviewProps) {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] hover:text-[#2563eb] transition-colors">
        ← Về trang chủ
      </Link>
      <header className="flex items-start justify-between border-b border-[#e2e8f0] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">TIẾNG HÀN TỔNG HỢP · QUYỂN 1</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e293b] mt-1 tracking-tight">Bài 1 · 자기소개</h1>
          <p className="text-xs md:text-sm text-[#64748b] mt-1">Giới thiệu bản thân bằng tiếng Hàn.</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebf2ff] text-base font-extrabold text-[#2563eb]">
          01
        </span>
      </header>

      <section className="rounded-2xl border border-[#dbeafe] bg-[#ebf2ff]/50 p-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">BẮT ĐẦU BÀI HỌC</span>
        <h2 className="text-xl font-bold text-[#1e293b]">Mình sẽ học gì hôm nay?</h2>
        <p className="text-xs md:text-sm text-[#475569]">
          Đi qua từng phần theo nhịp của bạn. Bạn có thể quay lại bất cứ lúc nào.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/vocabulary"
          className="group p-5 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center text-xl font-bold">
              가
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">PHẦN 01</span>
              <h3 className="text-base font-bold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
                Từ vựng
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">{vocabularyCount} từ trong bài</p>
            </div>
          </div>
          <span className="text-[#64748b] group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all text-lg font-bold">
            →
          </span>
        </Link>

        <Link
          href="/grammar"
          className="group p-5 rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#2563eb] hover:shadow-xs transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              문
            </span>
            <div>
              <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">PHẦN 02</span>
              <h3 className="text-base font-bold text-[#1e293b] group-hover:text-purple-600 transition-colors">
                Ngữ pháp
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">{grammarCount} điểm ngữ pháp</p>
            </div>
          </div>
          <span className="text-[#64748b] group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all text-lg font-bold">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
