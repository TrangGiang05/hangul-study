import type { VocabularyEntry } from "../content/vocabulary";

export type PracticeChoice = {
  id: string;
  meaning: string;
};

export type VocabularyPracticeQuestion = {
  entryId: string;
  korean: string;
  correctMeaning: string;
  choices: PracticeChoice[];
};

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

export function createVocabularyPracticeQuestions(
  entries: VocabularyEntry[],
  questionCount = 10,
): VocabularyPracticeQuestion[] {
  return shuffle(entries)
    .slice(0, Math.min(questionCount, entries.length))
    .map((entry) => {
      const distractors = shuffle(entries.filter((candidate) => candidate.id !== entry.id))
        .slice(0, 3)
        .map((candidate) => ({ id: candidate.id, meaning: candidate.meaning }));

      return {
        entryId: entry.id,
        korean: entry.korean,
        correctMeaning: entry.meaning,
        choices: shuffle([
          { id: entry.id, meaning: entry.meaning },
          ...distractors,
        ]),
      };
    });
}

  export function createVocabularyTypingQuestions(entries: VocabularyEntry[], questionCount = 10) {
    return shuffle(entries).slice(0, Math.min(questionCount, entries.length));
  }
