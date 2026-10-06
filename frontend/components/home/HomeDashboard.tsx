"use client";

import Image from "next/image";
import Link from "next/link";
import { CurrentDateLabel } from "./CurrentDateLabel";
import type { CSSProperties } from "react";
import { useSession } from "../../lib/auth-client";

type HomeDashboardProps = {
  initialProgressStats: {
    completedLessons: number;
    totalLessons: number;
  };
};

export function HomeDashboard({ initialProgressStats }: HomeDashboardProps) {
  const { data: session } = useSession();

  const progressPercentage = Math.round((initialProgressStats.completedLessons / initialProgressStats.totalLessons) * 100) || 0;

  return (
    <div className="home-page">
      <header className="page-header">
        <div>
          <CurrentDateLabel />
          <h1>Chào {session?.user?.name ? session.user.name.split(" ")[0] : "bạn"}.</h1>
          <p className="page-intro">Sẵn sàng mở thêm một cánh cửa tiếng Hàn hôm nay?</p>
        </div>
        <div className="header-profile" aria-label="Hồ sơ học viên">
          {session?.user?.image ? (
            <img src={session.user.image} alt="Avatar" className="profile-avatar object-cover" />
          ) : (
            <span className="profile-avatar">{session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "H"}</span>
          )}
          <span className="profile-name">{session?.user?.name || "Học viên"}</span>
        </div>
      </header>

      <section className="welcome-panel" aria-labelledby="continue-title">
        <div className="welcome-copy">
          <span className="section-kicker">Tiếp tục học</span>
          <h2 id="continue-title">Mỗi ngày một chút, tiếng Hàn sẽ gần hơn.</h2>
          <p>Bạn đã duy trì nhịp học x ngày. Hãy tiếp tục từ bài đang học nhé.</p>
          <Link href="/courses/tong-hop/books/book-01/lessons/lesson-01" className="primary-action">
            Tiếp tục học <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
        <div
          className="progress-ring"
          style={{ "--progress": `${progressPercentage}%` } as CSSProperties}
        >
          <strong>{progressPercentage}%</strong>
          <span>đã hoàn thành</span>
        </div>
      </section>

      <div className="home-grid">
        <section className="course-card" aria-labelledby="course-title">
          <div className="course-card-topline">
            <span className="section-kicker">Giáo trình của bạn</span>
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
                <strong>{initialProgressStats.completedLessons} / {initialProgressStats.totalLessons}</strong>
              </div>
              <div className="progress-bar" aria-label={`Tiến độ quyển học ${progressPercentage} phần trăm`}>
                <span style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>
          <Link href="/courses/tong-hop" className="text-action">
            Xem giáo trình <span aria-hidden="true">-&gt;</span>
          </Link>
        </section>

        <aside className="pengul-card" aria-labelledby="pengul-title">
          <div className="pengul-copy">
            <span className="section-kicker">Pengul nhắn bạn</span>
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
        <div className="today-label"><span>Hôm nay</span><strong>Giữ nhịp học nhẹ nhàng</strong></div>
        <div className="today-item"><span className="today-number">01</span><span>Ôn 10 từ vựng bài 1</span></div>
        <div className="today-item"><span className="today-number">02</span><span>Đọc lại mẫu câu giới thiệu</span></div>
      </section>
    </div>
  );
}