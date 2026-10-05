"use client";

import { useState } from "react";
import type { VocabularyEntry } from "../../lib/content/vocabulary";
import { createVocabularyTypingQuestions } from "../../lib/practice/vocabularyQuestions";
import { useAITutor } from "../ai/AITutorContext";

type LessonContext = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

type TypingPracticeProps = {
  entries: VocabularyEntry[];
  initialWords: VocabularyEntry[];
  lessonContext?: LessonContext;
};

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function TypingPractice({ entries, initialWords, lessonContext }: TypingPracticeProps) {
  const { openAITutor } = useAITutor();
  const [words, setWords] = useState(initialWords);
  const [wordIndex, setWordIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const currentWord = words[wordIndex];
  const isCorrect = currentWord ? normalizeAnswer(answer) === currentWord.korean : false;

  function checkAnswer() {
    if (!currentWord || !answer.trim() || isSubmitted) return;
    setIsSubmitted(true);
    if (isCorrect) setScore((currentScore) => currentScore + 1);
  }

  function nextWord() {
    if (!isSubmitted) return;
    if (wordIndex === words.length - 1) {
      setIsComplete(true);
      return;
    }
    setWordIndex((currentIndex) => currentIndex + 1);
    setAnswer("");
    setIsSubmitted(false);
  }

  function restart() {
    setWords(createVocabularyTypingQuestions(entries));
    setWordIndex(0);
    setAnswer("");
    setIsSubmitted(false);
    setScore(0);
    setIsComplete(false);
  }

  if (isComplete) {
    return (
      <section className="practice-result" aria-live="polite">
        <span className="practice-result-mark" aria-hidden="true">✓</span>
        <p className="practice-eyebrow">HOÀN THÀNH</p>
        <h2>Bạn đã hoàn thành bài luyện tập.</h2>
        <div className="practice-score-grid">
          <div><strong>{score}</strong><span>Đúng</span></div>
          <div><strong>{words.length - score}</strong><span>Sai</span></div>
          <div><strong>{score} / {words.length}</strong><span>Điểm</span></div>
        </div>
        <button type="button" className="practice-primary-button" onClick={restart}>Làm lại</button>
      </section>
    );
  }

  if (!currentWord) return null;

  return (
    <section className="practice-question" aria-labelledby="typing-meaning">
      <div className="practice-question-topline">
        <span>Câu {wordIndex + 1} / {words.length}</span>
        <span>Điểm {score}</span>
      </div>
      <div className="typing-word-block">
        <p className="practice-label">GÕ TỪ VỰNG</p>
        <h2 id="typing-meaning">{currentWord.meaning}</h2>
        {currentWord.practiceHint && (
          <p style={{ margin: "8px 0 0", color: "#4b5563", fontSize: "14px" }}>
            Gợi ý: {currentWord.practiceHint}
          </p>
        )}
        <p>Hãy viết từ này bằng tiếng Hàn.</p>
      </div>
      <form className="typing-form" onSubmit={(event) => { event.preventDefault(); checkAnswer(); }}>
        <label htmlFor="typing-answer">Đáp án tiếng Hàn</label>
        <input id="typing-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={isSubmitted} autoComplete="off" autoFocus />
        {!isSubmitted && <button type="submit" className="practice-next-button" disabled={!answer.trim()}>Kiểm tra <span aria-hidden="true">→</span></button>}
      </form>
      {isSubmitted && (
        <div className={`practice-feedback${isCorrect ? " is-correct" : " is-incorrect"}`} role="status">
          <strong>{isCorrect ? "✓ Chính xác!" : "✕ Chưa chính xác"}</strong>
          {!isCorrect && <span>Đáp án đúng: {currentWord.korean}</span>}
          {!isCorrect && (
            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  openAITutor(
                    {
                      courseId: lessonContext?.courseId ?? "tong-hop",
                      bookId: lessonContext?.bookId ?? "book-01",
                      lessonId: lessonContext?.lessonId ?? "lesson-01",
                      module: "practice",
                      contentId: currentWord.id,
                    },
                    `Mình vừa trả lời '${answer.trim()}' cho từ '${currentWord.meaning}' nhưng đáp án là '${currentWord.korean}'. Giải thích giúp mình lỗi sai nhé.`
                  );
                }}
                style={{
                  fontSize: "0.8125rem",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #bfdbfe",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                ✨ Hỏi AI về câu này
              </button>
            </div>
          )}
        </div>
      )}
      {isSubmitted && <button type="button" className="practice-next-button" onClick={nextWord}>{wordIndex === words.length - 1 ? "Xem kết quả" : "Câu tiếp theo"} <span aria-hidden="true">→</span></button>}
    </section>
  );
}