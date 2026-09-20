"use client";

import { useState } from "react";
import type { AlphabetEntry } from "../../lib/content/alphabet";

type AlphabetExplorerProps = {
  entries: AlphabetEntry[];
  categories: string[];
};

function speakCharacter(character: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(character);
  utterance.lang = "ko-KR";
  utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}

export function AlphabetExplorer({ entries, categories }: AlphabetExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedEntry, setSelectedEntry] = useState<AlphabetEntry | null>(null);
  const visibleEntries = selectedCategory === "Tất cả"
    ? entries
    : entries.filter((entry) => entry.category === selectedCategory);

  return (
    <div className="alphabet-explorer">
      <div className="alphabet-filter" role="tablist" aria-label="Lọc theo nhóm chữ cái">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selectedCategory === category}
            className={`alphabet-filter-button${selectedCategory === category ? " is-active" : ""}`}
            onClick={() => {
              setSelectedCategory(category);
              setSelectedEntry(null);
            }}
          >
            {category}
            <span>{category === "Tất cả" ? entries.length : entries.filter((entry) => entry.category === category).length}</span>
          </button>
        ))}
      </div>

      {selectedEntry && (
        <section className="alphabet-detail" aria-live="polite" aria-labelledby="alphabet-detail-title">
          <div className="alphabet-detail-character">{selectedEntry.character}</div>
          <div className="alphabet-detail-copy">
            <span className="section-kicker">CHI TIẾT CHỮ CÁI</span>
            <h2 id="alphabet-detail-title">{selectedEntry.character} <span>/{selectedEntry.pronunciation}/</span></h2>
            <p className="alphabet-detail-category">{selectedEntry.category}</p>
            <p className="alphabet-letter-name"><strong>Tên chữ:</strong> {selectedEntry.letterName} <span>({selectedEntry.letterNamePronunciation})</span></p>
            {selectedEntry.example && <p><strong>Ví dụ:</strong> {selectedEntry.example}</p>}
            {selectedEntry.exampleMeaning && <p><strong>Nghĩa:</strong> {selectedEntry.exampleMeaning}</p>}
            {selectedEntry.notes && <p><strong>Ghi chú:</strong> {selectedEntry.notes}</p>}
            {!selectedEntry.example && !selectedEntry.exampleMeaning && !selectedEntry.notes && (
              <p className="alphabet-empty-detail">Dữ liệu ví dụ và ghi chú sẽ được bổ sung sau.</p>
            )}
          </div>
          <button type="button" className="alphabet-detail-close" onClick={() => setSelectedEntry(null)} aria-label="Đóng chi tiết">×</button>
        </section>
      )}

      <div className="alphabet-results-bar">
        <span>Hiển thị {visibleEntries.length} chữ cái</span>
        <span className="alphabet-results-hint">Chọn một chữ để xem chi tiết</span>
      </div>

      <div className="alphabet-grid">
        {visibleEntries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`alphabet-card${selectedEntry?.id === entry.id ? " is-selected" : ""}`}
            onClick={() => {
              setSelectedEntry(entry);
              speakCharacter(entry.character);
            }}
            aria-label={`Nghe phát âm và xem chi tiết chữ ${entry.character}`}
          >
            <span className="alphabet-card-id">{entry.id}</span>
            <strong className="alphabet-character">{entry.character}</strong>
            <span className="alphabet-pronunciation">/{entry.pronunciation}/</span>
            <span className="alphabet-card-category">{entry.category}</span>
            {entry.example && <span className="alphabet-card-example">Ví dụ: {entry.example}</span>}
          </button>
        ))}
      </div>

    </div>
  );
}