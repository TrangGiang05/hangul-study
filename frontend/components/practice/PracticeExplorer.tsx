"use client";

import { useState } from "react";
import type { VocabularyEntry } from "../../lib/content/vocabulary";
import {
  createVocabularyPracticeQuestions,
  type VocabularyPracticeQuestion,
} from "../../lib/practice/vocabularyQuestions";
import { TypingPractice } from "./TypingPractice";
import { useAITutor } from "../ai/AITutorContext";

type LessonContext = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

type PracticeExplorerProps = {
  entries: VocabularyEntry[];
  initialQuestions: VocabularyPracticeQuestion[];
  initialTypingWords: VocabularyEntry[];
  lessonContext?: LessonContext;
};

type PracticeMode = "multiple-choice" | "typing";

export function PracticeExplorer({
  entries,
  initialQuestions,
  initialTypingWords,
  lessonContext,
}: PracticeExplorerProps) {
  const { openAITutor } = useAITutor();
  const [questions, setQuestions] = useState(initialQuestions);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [mode, setMode] = useState<PracticeMode>("multiple-choice");

  const currentQuestion = questions[questionIndex];
  const selectedChoice = currentQuestion?.choices.find((choice) => choice.id === selectedChoiceId);
  const isCorrect = selectedChoiceId === currentQuestion?.entryId;

  function selectChoice(choiceId: string) {
    if (selectedChoiceId || !currentQuestion) return;

    setSelectedChoiceId(choiceId);
    if (choiceId === currentQuestion.entryId) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function goToNextQuestion() {
    if (!selectedChoiceId) return;
    if (questionIndex === questions.length - 1) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex((currentIndex) => currentIndex + 1);
    setSelectedChoiceId(null);
  }

  function restartPractice() {
    setQuestions(createVocabularyPracticeQuestions(entries));
    setQuestionIndex(0);
    setSelectedChoiceId(null);
    setScore(0);
    setIsComplete(false);
  }

  if (entries.length === 0 || questions.length === 0) {
    return (
      <section className="practice-empty" aria-live="polite">
        <strong>Chưa có từ vựng để luyện tập.</strong>
        <span>Hãy bổ sung dữ liệu từ vựng cho bài học này trước.</span>
      </section>
    );
  }

  const modeSwitch = (
    <div className="practice-mode-switch" role="tablist" aria-label="Chọn dạng luyện tập">
      <button type="button" role="tab" aria-selected={mode === "multiple-choice"} className={mode === "multiple-choice" ? "is-active" : ""} onClick={() => setMode("multiple-choice")}>Trắc nghiệm</button>
      <button type="button" role="tab" aria-selected={mode === "typing"} className={mode === "typing" ? "is-active" : ""} onClick={() => setMode("typing")}>Gõ từ vựng</button>
    </div>
  );

  if (mode === "typing") {
    return (
      <div className="practice-mode-content">
        {modeSwitch}
        <TypingPractice entries={entries} initialWords={initialTypingWords} lessonContext={lessonContext} />
      </div>
    );
  }

  if (isComplete) {
    return (
      <section className="practice-result" aria-live="polite">
        <span className="practice-result-mark" aria-hidden="true">✓</span>
        <p className="practice-eyebrow">HOÀN THÀNH</p>
        <h2>Bạn đã hoàn thành bài luyện tập.</h2>
        <div className="practice-score-grid">
          <div><strong>{score}</strong><span>Đúng</span></div>
          <div><strong>{questions.length - score}</strong><span>Sai</span></div>
          <div><strong>{score} / {questions.length}</strong><span>Điểm</span></div>
        </div>
        <button type="button" className="practice-primary-button" onClick={restartPractice}>Làm lại</button>
      </section>
    );
  }

  return (
    <div className="practice-mode-content">
      {modeSwitch}
    <section className="practice-question" aria-labelledby="practice-word">
      <div className="practice-question-topline">
        <span>Câu {questionIndex + 1} / {questions.length}</span>
        <span>Điểm {score}</span>
      </div>
      <div className="practice-word-block">
        <p className="practice-label">TỪ VỰNG</p>
        <h2 id="practice-word">{currentQuestion.korean}</h2>
        <p>Nghĩa của từ trên là gì?</p>
      </div>
      <div className="practice-choices" role="group" aria-label="Các đáp án">
        {currentQuestion.choices.map((choice, index) => {
          const isSelected = selectedChoiceId === choice.id;
          const isAnswer = choice.id === currentQuestion.entryId;
          const stateClass = selectedChoiceId
            ? isAnswer ? " is-correct" : isSelected ? " is-incorrect" : " is-muted"
            : "";

          return (
            <button
              key={`${currentQuestion.entryId}-${choice.id}`}
              type="button"
              className={`practice-choice${stateClass}`}
              onClick={() => selectChoice(choice.id)}
              disabled={Boolean(selectedChoiceId)}
            >
              <span className="practice-choice-letter">{String.fromCharCode(65 + index)}</span>
              <span>{choice.meaning}</span>
              {selectedChoiceId && isAnswer && <span className="practice-choice-mark" aria-label="Đáp án đúng">✓</span>}
              {selectedChoiceId && isSelected && !isAnswer && <span className="practice-choice-mark" aria-label="Đáp án đã chọn">×</span>}
            </button>
          );
        })}
      </div>
      {selectedChoiceId && (
        <div className={`practice-feedback${isCorrect ? " is-correct" : " is-incorrect"}`} role="status">
          <strong>{isCorrect ? "✓ Chính xác!" : "✕ Chưa chính xác"}</strong>
          {!isCorrect && <span>Đáp án đúng: {currentQuestion.correctMeaning}</span>}
          {selectedChoice && !isCorrect && <span>Bạn đã chọn: {selectedChoice.meaning}</span>}
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
                    contentId: currentQuestion.entryId,
                  },
                  `Giải thích giúp mình câu hỏi về từ '${currentQuestion.korean}' trong bài luyện tập.`
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
        </div>
      )}
      <button type="button" className="practice-next-button" onClick={goToNextQuestion} disabled={!selectedChoiceId}>
        {questionIndex === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"} <span aria-hidden="true">→</span>
      </button>
    </section>
    </div>
  );
}
