"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { useAITutor } from "../../components/ai/AITutorContext";
import { AIMessageAudio } from "../../components/ai/AIMessageAudio";
import { stopSpeech } from "../../lib/ai/tts";
import type { LearningContext } from "../../lib/ai/context";

import { Suspense } from "react";

export default function AiTutorPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<div className="p-8 text-center text-gray-500">Đang tải AI Tutor...</div>}>
                <AiTutorMain />
            </Suspense>
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

    // Stop speech on page unmount
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, []);

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
        <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Tutor</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Hỏi đáp & hỗ trợ học tiếng Hàn cùng giáo trình Hangul Study
                    </p>
                    {activeContext.module && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
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
                        onClick={() => {
                            stopSpeech();
                            newChat();
                        }}
                        disabled={loading}
                        className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-2xs"
                    >
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Cuộc trò chuyện mới
                    </button>
                )}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
                className="flex gap-2"
            >
                <input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ví dụ: Giải thích ngữ pháp -아/어요 hoặc cách dùng từ 한국..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 shadow-2xs"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap transition-colors shadow-2xs"
                >
                    {loading ? "Đang gửi..." : "Gửi"}
                </button>
            </form>

            {messages.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                        <div className="h-16 w-16 relative shrink-0">
                            <Image
                                src="/assets/mascot/pengul.png"
                                alt="Pengul"
                                width={64}
                                height={64}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-lg font-bold text-gray-900">
                                Xin chào! Mình là Pengul - trợ lý học tập của bạn.
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Bạn muốn học gì hôm nay? Hãy chọn một gợi ý dưới đây hoặc gửi câu hỏi bất kỳ.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                                {[
                                    "Giải thích ngữ pháp",
                                    "Từ vựng theo chủ đề",
                                    "Luyện tập hội thoại",
                                    "Bài tập khó hơn",
                                ].map((promptText) => (
                                    <button
                                        key={promptText}
                                        type="button"
                                        onClick={() => sendMessage(promptText)}
                                        disabled={loading}
                                        className="rounded-full border border-blue-200 bg-blue-50/70 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-2xs"
                                    >
                                        💡 {promptText}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 pt-2">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${
                                msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            {msg.role === "assistant" && (
                                <div className="h-9 w-9 relative shrink-0 mt-1 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shadow-2xs">
                                    <Image
                                        src="/assets/mascot/pengul.png"
                                        alt="Pengul"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <div
                                className={`rounded-xl border p-4 max-w-[85%] shadow-2xs ${
                                    msg.role === "user"
                                        ? "bg-blue-600 border-blue-600 text-white rounded-tr-xs"
                                        : msg.isError
                                        ? "bg-red-50 border border-red-200 text-red-900 rounded-tl-xs"
                                        : "bg-white border border-gray-200 text-gray-900 rounded-tl-xs"
                                }`}
                            >
                                <h2 className={`font-semibold text-xs uppercase tracking-wider mb-1.5 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                                    {msg.role === "user" ? "Bạn" : "AI Tutor"}
                                </h2>
                                <div className={`prose max-w-none text-sm leading-relaxed ${msg.role === "user" ? "text-white prose-invert" : "text-gray-800"}`}>
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                                {msg.role === "assistant" && !msg.isError && <AIMessageAudio text={msg.text} />}
                                {msg.isError && (
                                    <div className="mt-3 flex">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const idx = messages.indexOf(msg);
                                                const userMsg = messages[idx - 1]?.text;
                                                if (userMsg) {
                                                    sendMessage(userMsg, true);
                                                }
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors border border-red-200 cursor-pointer"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Thử lại
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3 items-center">
                            <div className="h-9 w-9 relative shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shadow-2xs">
                                <Image
                                    src="/assets/mascot/pengul.png"
                                    alt="Pengul"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <div className="rounded-2xl rounded-tl-xs border border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 shadow-xs flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span>AI Tutor đang suy nghĩ và trả lời...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}