import Link from "next/link";

type LessonOverviewProps = {
  vocabularyCount: number;
  grammarCount: number;
};

export function LessonOverview({ vocabularyCount, grammarCount }: LessonOverviewProps) {
  return (
    <div className="lesson-overview">
      <Link href="/" className="lesson-back-link">← Về trang chủ</Link>
      <header className="lesson-header">
        <div>
          <p className="eyebrow">TIẾNG HÀN TỔNG HỢP · QUYỂN 1</p>
          <h1>Bài 1 · 자기소개</h1>
          <p>Giới thiệu bản thân bằng tiếng Hàn.</p>
        </div>
        <span className="lesson-number">01</span>
      </header>

      <section className="lesson-intro" aria-labelledby="lesson-intro-title">
        <span className="section-kicker">BẮT ĐẦU BÀI HỌC</span>
        <h2 id="lesson-intro-title">Mình sẽ học gì hôm nay?</h2>
        <p>Đi qua từng phần theo nhịp của bạn. Bạn có thể quay lại bất cứ lúc nào.</p>
      </section>

      <div className="lesson-sections">
        <Link href="/vocabulary" className="lesson-section-card lesson-section-vocabulary">
          <span className="lesson-section-icon" aria-hidden="true">가</span>
          <span className="lesson-section-copy">
            <small>PHẦN 01</small>
            <strong>Từ vựng</strong>
            <span>{vocabularyCount} từ trong bài</span>
          </span>
          <span className="lesson-section-arrow" aria-hidden="true">→</span>
        </Link>
        <Link href="/grammar" className="lesson-section-card lesson-section-grammar">
          <span className="lesson-section-icon" aria-hidden="true">문</span>
          <span className="lesson-section-copy">
            <small>PHẦN 02</small>
            <strong>Ngữ pháp</strong>
            <span>{grammarCount} điểm ngữ pháp</span>
          </span>
          <span className="lesson-section-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
