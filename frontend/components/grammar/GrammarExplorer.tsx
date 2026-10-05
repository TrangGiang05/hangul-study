"use client";

import { useState } from "react";
import type { GrammarEntry } from "../../lib/content/grammar";
import { useAITutor } from "../ai/AITutorContext";

type LessonContext = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

type GrammarExplorerProps = {
  entries: GrammarEntry[];
  lessonContext?: LessonContext;
};
type LearnedState = Record<string, boolean>;

export function GrammarExplorer({ entries, lessonContext }: GrammarExplorerProps) {
  const { openAITutor } = useAITutor();
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? "");
  const [learnedState, setLearnedState] = useState<LearnedState>({});
  const selectedEntry = entries.find((entry) => entry.id === selectedId) ?? entries[0];
  const learnedCount = entries.filter((entry) => learnedState[entry.id]).length;

  if (!selectedEntry) {
    return (
      <section className="grammar-empty" aria-live="polite">
        <strong>Chưa có dữ liệu ngữ pháp.</strong>
        <span>Hãy bổ sung nội dung cho bài học này trước.</span>
      </section>
    );
  }

  return (
    <div className="grammar-explorer">
      <nav className="grammar-list" aria-label="Danh sách điểm ngữ pháp">
        <div className="grammar-list-heading">
          <span>Trong bài này</span>
          <strong>{learnedCount}/{entries.length} đã học</strong>
        </div>
        {entries.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            className={`grammar-list-item${entry.id === selectedEntry.id ? " is-active" : ""}`}
            onClick={() => setSelectedId(entry.id)}
            aria-pressed={entry.id === selectedEntry.id}
          >
            <span className="grammar-list-number">{String(index + 1).padStart(2, "0")}</span>
            <span>
              <strong>{entry.title}</strong>
              <small>{entry.meaning}</small>
            </span>
            <span className={`grammar-list-status${learnedState[entry.id] ? " is-learned" : ""}`} aria-label={learnedState[entry.id] ? "Đã học" : "Chưa học"}>
              {learnedState[entry.id] ? "✓" : ""}
            </span>
          </button>
        ))}
      </nav>

      <article className="grammar-detail" aria-live="polite" aria-labelledby="grammar-detail-title">
        <div className="grammar-detail-topline">
          <span className="grammar-detail-label">ĐIỂM NGỮ PHÁP</span>
          <span className="grammar-detail-id">{selectedEntry.id}</span>
        </div>
        <h2 id="grammar-detail-title">{selectedEntry.title}</h2>
        <div className="grammar-pattern">
          <span>Cấu trúc</span>
          <strong>{selectedEntry.pattern}</strong>
        </div>
        <div className="grammar-meaning">
          <span>Ý nghĩa</span>
          <p>{selectedEntry.meaning}</p>
        </div>
        {selectedEntry.explanation && (
          <div className="grammar-section">
            <h3>Cách dùng</h3>
            <p>{selectedEntry.explanation}</p>
          </div>
        )}
        {selectedEntry.structure && (
          <div className="grammar-section">
            <h3>Ghi nhớ</h3>
            <p>{selectedEntry.structure}</p>
          </div>
        )}
        {selectedEntry.examples.length > 0 && (
          <div className="grammar-section">
            <h3>Ví dụ</h3>
            <div className="grammar-examples">
              {selectedEntry.examples.map((example, index) => (
                <div className="grammar-example" key={`${selectedEntry.id}-example-${index}`}>
                  <p>{example.korean}</p>
                  <span>{example.translation}</span>
                  {example.notes && <small>{example.notes}</small>}
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedEntry.notes && (
          <div className="grammar-notes">
            <strong>Ghi chú</strong>
            <p>{selectedEntry.notes}</p>
          </div>
        )}
        <button
          type="button"
          className={`grammar-learned-button${learnedState[selectedEntry.id] ? " is-learned" : ""}`}
          onClick={() => setLearnedState((current) => ({
            ...current,
            [selectedEntry.id]: !current[selectedEntry.id],
          }))}
        >
          {learnedState[selectedEntry.id] ? "✓ Đã học" : "Đánh dấu đã học"}
        </button>
        <button
          type="button"
          onClick={() => {
            openAITutor({
              courseId: lessonContext?.courseId ?? "tong-hop",
              bookId: lessonContext?.bookId ?? "book-01",
              lessonId: lessonContext?.lessonId ?? "lesson-01",
              module: "grammar",
              contentId: selectedEntry.id,
            });
          }}
          className="grammar-ai-button"
          style={{ cursor: "pointer", opacity: 1 }}
        >
          Hỏi AI <span aria-hidden="true">↗</span>
        </button>
      </article>
    </div>
  );
}
