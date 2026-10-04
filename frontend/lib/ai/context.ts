/**
 * LearningContext
 *
 * Structured representation of where the learner is inside the learning flow
 * when they open the AI Tutor. Sent to FastAPI as the `context` field of every
 * /ai/chat request.
 *
 * Designed to be extensible: new modules (e.g. "practice", "review") can be
 * added to LearningModule without changing the shape of ChatRequest.
 */

export type LearningModule = "vocabulary" | "grammar" | "practice" | "lesson";

export type LearningContext = {
  /** Identifies the course, e.g. "tong-hop" */
  courseId: string;
  /** Identifies the book inside the course, e.g. "book-01" */
  bookId: string;
  /** Identifies the lesson, e.g. "lesson-01" */
  lessonId: string;
  /**
   * The active learning module. Empty string means the user opened the AI
   * Tutor standalone (no specific module context).
   */
  module: LearningModule | "";
  /**
   * Stable ID of the specific content item being studied, e.g. "L01-V001".
   * Empty string when the user asks a general question not tied to an item.
   */
  contentId: string;
};
