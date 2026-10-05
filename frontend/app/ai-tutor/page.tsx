"use client";

import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { useAITutor } from "../../components/ai/AITutorContext";
import type { LearningContext } from "../../lib/ai/context";

export default function AiTutorPage() {
    return (
        <DashboardLayout>
            <AiTutorMain />
        </DashboardLayout>
    );
}

function AiTutorMain() {
    const {
        messages,
        loading,
        inputMessage,
        setInputMessage,
        sendMessage,
        newChat,
        openAITutor,
        activeContext,
    } = useAITutor();

    const searchParams = useSearchParams();

    // Reconstruct the structured learning context from URL query parameters.
    const urlCourseId = searchParams.get("courseId");
    const urlBookId = searchParams.get("bookId");
    const urlLessonId = searchParams.get("lessonId");
    const urlModule = searchParams.get("module") as LearningContext["module"] | null;
    const urlContentId = searchParams.get("contentId");

    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (!hasInitializedRef.current && (urlCourseId || urlBookId || urlLessonId || urlModule || urlContentId)) {
            hasInitializedRef.current = true;
            // Initialize active context without opening the slide-over drawer
            openAITutor(
                {
                    courseId: urlCourseId ?? undefined,
                    bookId: urlBookId ?? undefined,
                    lessonId: urlLessonId ?? undefined,
                    module: urlModule ?? undefined,
                    contentId: urlContentId ?? undefined,
                },
                undefined,
                false
            );
        }
    }, [urlCourseId, urlBookId, urlLessonId, urlModule, urlContentId, openAITutor]);

    const moduleLabels: Record<string, string> = {
        vocabulary: "Từ vựng",
        grammar: "Ngữ pháp",
        practice: "Luyện tập",
        lesson: "Bài học",
    };
    const currentModule = moduleLabels[activeContext.module] || "Chung";

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Tutor</h1>
                    <p className="mt-1 text-gray-600">
                        Hỏi đáp & hỗ trợ học tiếng Hàn cùng giáo trình Hangul Study
                    </p>
                    {activeContext.module && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                Đang học: {activeContext.lessonId} · {currentModule}
                            </span>
                            {activeContext.contentId && (
                                <span className="text-xs text-gray-500 font-mono">
                                    #{activeContext.contentId}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={newChat}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        Cuộc trò chuyện mới
                    </button>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
                className="mt-6 flex gap-2"
            >
                <input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ví dụ: Từ 한국 dùng như thế nào?"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap transition-colors"
                >
                    {loading ? "Đang trả lời..." : "Gửi"}
                </button>
            </form>

            {messages.length > 0 && (
                <div className="mt-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`rounded-xl border p-4 shadow-2xs ${
                                msg.role === "user"
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-white border-gray-200"
                            }`}
                        >
                            <h2 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-1.5">
                                {msg.role === "user" ? "Bạn" : "AI Tutor"}
                            </h2>
                            <div className="prose max-w-none text-gray-800 text-sm">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-gray-500 text-sm italic">
                            AI Tutor đang suy nghĩ và trả lời...
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}