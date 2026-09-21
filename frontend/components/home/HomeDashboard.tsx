import Image from "next/image";
import Link from "next/link";

export function HomeDashboard() {
  return (
    <div className="home-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">THỨ HAI, 21 THÁNG 9</p>
          <h1>Chào buổi sáng, Minh.</h1>
          <p className="page-intro">Sẵn sàng mở thêm một cánh cửa tiếng Hàn hôm nay?</p>
        </div>
        <div className="header-profile" aria-label="Hồ sơ của Minh">
          <span className="profile-avatar">M</span>
          <span className="profile-name">Minh</span>
        </div>
      </header>

      <section className="welcome-panel" aria-labelledby="continue-title">
        <div className="welcome-copy">
          <span className="section-kicker">TIẾP TỤC HỌC</span>
          <h2 id="continue-title">Mỗi ngày một chút, tiếng Hàn sẽ gần hơn.</h2>
          <p>Bạn đã duy trì nhịp học 3 ngày. Hãy tiếp tục từ bài đang học nhé.</p>
            <Link href="/courses/tong-hop/books/book-01/lessons/lesson-01" className="primary-action">
            Tiếp tục học <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
        <div className="progress-orbit" aria-label="Tiến độ bài học 24 phần trăm">
          <div className="progress-ring">
            <strong>24%</strong>
            <span>đã hoàn thành</span>
          </div>
        </div>
      </section>

      <div className="home-grid">
        <section className="course-card" aria-labelledby="course-title">
          <div className="course-card-topline">
            <span className="section-kicker">GIÁO TRÌNH CỦA BẠN</span>
            <span className="course-status">Đang học</span>
          </div>
          <div className="course-content">
            <div className="book-cover">
              <Image
                src="/assets/course/tong-hop-so-cap-1-book-01-cover.png"
                alt="Bìa giáo trình Tiếng Hàn Tổng hợp Sơ cấp 1"
                width={495}
                height={677}
                className="book-cover-image"
              />
            </div>
            <div>
              <h2 id="course-title">Tiếng Hàn Tổng hợp Sơ cấp 1</h2>
              <p>Quyển 1 <span className="muted-dot">•</span> Bài 1: 자기소개</p>
              <div className="course-progress-label">
                <span>Tiến độ quyển học</span>
                <strong>24 / 100</strong>
              </div>
              <div className="progress-bar" aria-label="Tiến độ quyển học 24 phần trăm">
                <span />
              </div>
            </div>
          </div>
            <Link href="/courses/tong-hop" className="text-action">
            Xem giáo trình <span aria-hidden="true">-&gt;</span>
          </Link>
        </section>

        <aside className="pengul-card" aria-labelledby="pengul-title">
          <div className="pengul-copy">
            <span className="section-kicker">PENGUL NHẮN BẠN</span>
            <h2 id="pengul-title">안녕하세요!</h2>
            <p>Chỉ cần 15 phút hôm nay. Mình cùng học một từ mới nhé?</p>
            <Link href="/vocabulary" className="text-action">Mở từ vựng <span aria-hidden="true">-&gt;</span></Link>
          </div>
          <Image
            src="/assets/mascot/pengul.png"
            alt="Pengul cầm bảng tiếng Hàn"
            width={1280}
            height={1280}
            className="pengul-image"
          />
        </aside>
      </div>

      <section className="today-strip" aria-label="Gợi ý học hôm nay">
        <div className="today-label"><span>HÔM NAY</span><strong>Giữ nhịp học nhẹ nhàng</strong></div>
        <div className="today-item"><span className="today-number">01</span><span>Ôn 10 từ vựng bài 1</span></div>
        <div className="today-item"><span className="today-number">02</span><span>Đọc lại mẫu câu giới thiệu</span></div>
      </section>
    </div>
  );
}