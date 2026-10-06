"use client";

import { useEffect, useRef } from "react";
import { startLesson } from "../../app/actions/lesson";

type LessonTrackerProps = {
  courseId: string;
  bookId: string;
  lessonId: string;
};

export function LessonTracker({ courseId, bookId, lessonId }: LessonTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    startLesson({ courseId, bookId, lessonId }).catch(console.error);
  }, [courseId, bookId, lessonId]);

  return null;
}
