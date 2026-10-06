"use client";

import { useMemo, useState } from "react";
import type { VocabularyEntry } from "../../lib/content/vocabulary";
import { useAITutor } from "../ai/AITutorContext";
import { toggleVocabularyMastery } from "../../app/actions/vocabulary";

type LessonContext = {
    courseId: string;
    bookId: string;
    lessonId: string;
};

type VocabularyExplorerProps = {
    entries: VocabularyEntry[];
    /** Lesson identifiers forwarded to the AI Tutor link. */
    lessonContext?: LessonContext;
    initialKnownState?: KnownState;
};
type VocabularyFilter = "all" | "unknown" | "known";
type KnownState = Record<string, boolean>;

function speakKorean(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

function shuffleEntries(entries: VocabularyEntry[]) {
    const shuffled = [...entries];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
}

export function VocabularyExplorer({ entries, lessonContext, initialKnownState = {} }: VocabularyExplorerProps) {
    const { openAITutor } = useAITutor();
    const [orderedEntries, setOrderedEntries] = useState(entries);
    const [filter, setFilter] = useState<VocabularyFilter>("all");
    const [knownState, setKnownState] = useState<KnownState>(initialKnownState);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const filteredEntries = useMemo(() => {
        if (filter === "all") return orderedEntries;
        return orderedEntries.filter((entry) => filter === "known" ? knownState[entry.id] : !knownState[entry.id]);
    }, [filter, knownState, orderedEntries]);

    const safeIndex = Math.min(currentIndex, Math.max(filteredEntries.length - 1, 0));
    const currentEntry = filteredEntries[safeIndex];
    const knownCount = orderedEntries.filter((entry) => knownState[entry.id]).length;

    function updateFilter(nextFilter: VocabularyFilter) {
        setFilter(nextFilter);
        setCurrentIndex(0);
        setIsFlipped(false);
    }

    function shuffleCurrentList() {
        setOrderedEntries((current) => shuffleEntries(current));
        setCurrentIndex(0);
        setIsFlipped(false);
    }

    function moveTo(index: number) {
        setCurrentIndex(index);
        setIsFlipped(false);
    }

    return (
        <div className="vocabulary-explorer">
            <div className="vocabulary-toolbar">
                <div className="vocabulary-filters" role="tablist" aria-label="Lọc từ vựng">
                    <button type="button" role="tab" aria-selected={filter === "all"} className={`vocabulary-filter${filter === "all" ? " is-active" : ""}`} onClick={() => updateFilter("all")}>Tất cả <span>{entries.length}</span></button>
                    <button type="button" role="tab" aria-selected={filter === "unknown"} className={`vocabulary-filter${filter === "unknown" ? " is-active" : ""}`} onClick={() => updateFilter("unknown")}>Chưa nhớ <span>{entries.length - knownCount}</span></button>
                    <button type="button" role="tab" aria-selected={filter === "known"} className={`vocabulary-filter${filter === "known" ? " is-active" : ""}`} onClick={() => updateFilter("known")}>Đã nhớ <span>{knownCount}</span></button>
                </div>
                <button type="button" className="shuffle-button" onClick={shuffleCurrentList} disabled={orderedEntries.length < 2}><span aria-hidden="true">⤨</span> Xáo trộn</button>
            </div>

            {currentEntry ? (
                <section className="vocabulary-card" aria-live="polite">
                    <div className="vocabulary-card-position">Từ {safeIndex + 1} / {filteredEntries.length}</div>
                    <div
                        className={`vocabulary-card-inner${isFlipped ? " is-flipped" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-label={isFlipped ? "Mặt sau thẻ từ vựng. Nhấn để xem mặt trước" : "Mặt trước thẻ từ vựng. Nhấn để xem mặt sau"}
                        onClick={() => setIsFlipped((flipped) => !flipped)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setIsFlipped((flipped) => !flipped);
                            }
                        }}
                    >
                        {/* MẶT TRƯỚC */}
                        <div className="vocabulary-card-face vocabulary-card-front">
                            <div className="vocabulary-word-row">
                                <h2 id="vocabulary-word">{currentEntry.korean}</h2>

                                <button
                                    type="button"
                                    className="speaker-button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        speakKorean(currentEntry.korean);
                                    }}
                                    aria-label={`Phát âm ${currentEntry.korean}`}
                                    title="Nghe phát âm"
                                >
                                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 10v4h3l4 3V7l-4 3H4Z" />
                                        <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" />
                                    </svg>
                                </button>
                            </div>

                            <p className="vocabulary-flip-hint">
                                Nhấn vào thẻ để xem nghĩa
                            </p>
                        </div>

                        {/* MẶT SAU */}
                        <div className="vocabulary-card-face vocabulary-card-back">
                            <h2 className="vocabulary-back-word">{currentEntry.korean}</h2>
                            <div className="vocabulary-back-content">
                                <p className="vocabulary-meaning">
                                    {currentEntry.meaning}
                                </p>

                                <span className="vocabulary-part-of-speech">
                                    {currentEntry.partOfSpeech}
                                </span>
                            </div>

                            {currentEntry.examples[0] && (
                                <div className="vocabulary-example">
                                    <span className="vocabulary-label">VÍ DỤ</span>
                                    <p>{currentEntry.examples[0].korean}</p>
                                    <span>{currentEntry.examples[0].translation}</span>
                                </div>
                            )}

                            {currentEntry.notes && (
                                <p className="vocabulary-notes">
                                    Ghi chú: {currentEntry.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            openAITutor({
                                courseId: lessonContext?.courseId ?? "tong-hop",
                                bookId: lessonContext?.bookId ?? "book-01",
                                lessonId: lessonContext?.lessonId ?? "lesson-01",
                                module: "vocabulary",
                                contentId: currentEntry.id,
                            });
                        }}
                        className="ai-tutor-button"
                    >
                        ✨ Hỏi AI
                    </button>
                    
                    <div className="vocabulary-actions" aria-label="Đánh dấu trạng thái từ vựng">
                        <button
                            type="button"
                            className={`unknown-button${knownState[currentEntry.id] === false ? " is-selected" : ""
                                }`}
                            onClick={async (event) => {
                                event.stopPropagation();
                                const isCurrentlyKnown = knownState[currentEntry.id];
                                if (isCurrentlyKnown === false) return; // already unknown
                                
                                setKnownState((current) => ({ ...current, [currentEntry.id]: false }));
                                if (lessonContext) {
                                    const res = await toggleVocabularyMastery({
                                        ...lessonContext,
                                        itemId: currentEntry.id,
                                        isKnown: false
                                    });
                                    if (res && !res.success && res.error !== "Unauthorized") {
                                        // Revert on real failure (ignore Unauthorized for Guest)
                                        setKnownState((current) => ({ ...current, [currentEntry.id]: isCurrentlyKnown }));
                                    }
                                }
                            }}
                        >
                            ✕ Chưa nhớ
                        </button>
                        <button
                            type="button"
                            className={`known-button${knownState[currentEntry.id] === true ? " is-selected" : ""
                                }`}
                            onClick={async (event) => {
                                event.stopPropagation();
                                const isCurrentlyKnown = knownState[currentEntry.id];
                                if (isCurrentlyKnown === true) return; // already known

                                setKnownState((current) => ({ ...current, [currentEntry.id]: true }));
                                if (lessonContext) {
                                    const res = await toggleVocabularyMastery({
                                        ...lessonContext,
                                        itemId: currentEntry.id,
                                        isKnown: true
                                    });
                                    if (res && !res.success && res.error !== "Unauthorized") {
                                        // Revert on real failure (ignore Unauthorized for Guest)
                                        setKnownState((current) => ({ ...current, [currentEntry.id]: isCurrentlyKnown }));
                                    }
                                }
                            }}
                        >
                            ✓ Đã nhớ
                        </button>
                    </div>
                </section>
            ) : (
                <section className="vocabulary-empty"><strong>Chưa có từ nào trong nhóm này.</strong><span>Hãy thử chọn bộ lọc khác.</span></section>
            )}

            <div className="vocabulary-navigation">
                <button type="button" className="vocabulary-nav-button" onClick={() => moveTo(Math.max(safeIndex - 1, 0))}
                    disabled={!currentEntry || safeIndex === 0}>← Trước</button>
                <span>{currentEntry ? `${safeIndex + 1} / ${filteredEntries.length}` : "0 / 0"}</span>
                <button type="button" className="vocabulary-nav-button is-next" onClick={() => moveTo(Math.min(safeIndex + 1, filteredEntries.length - 1))} disabled={!currentEntry || safeIndex === filteredEntries.length - 1}>Sau →</button>
            </div>
        </div>
    );
}
