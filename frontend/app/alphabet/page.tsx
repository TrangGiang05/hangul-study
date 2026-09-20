import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { AlphabetExplorer } from "../../components/alphabet/AlphabetExplorer";
import { alphabetCategories, alphabetEntries } from "../../lib/content/alphabet";

export default function AlphabetPage() {
  return (
    <DashboardLayout>
      <div className="alphabet-page">
        <header className="alphabet-page-header">
          <div>
            <p className="eyebrow">BƯỚC ĐẦU TIÊN</p>
            <h1>Bảng chữ cái</h1>
            <p className="alphabet-page-intro">
              Làm quen với những nguyên âm và phụ âm nền tảng để bắt đầu đọc tiếng Hàn tự tin hơn.
            </p>
          </div>
          <div className="alphabet-page-count"><strong>{alphabetEntries.length}</strong><span>chữ cái<br />cơ bản</span></div>
        </header>
        <AlphabetExplorer entries={alphabetEntries} categories={alphabetCategories} />
      </div>
    </DashboardLayout>
  );
}