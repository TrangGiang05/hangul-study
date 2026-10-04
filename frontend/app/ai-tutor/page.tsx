"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import type { LearningContext } from "../../lib/ai/context";

type Message = {
    role: "user" | "assistant";
    text: string;
};

export default function AiTutorPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();

    // Reconstruct the structured learning context from URL query parameters.
    const context: LearningContext = {
        courseId: searchParams.get("courseId") ?? "",
        bookId: searchParams.get("bookId") ?? "",
        lessonId: searchParams.get("lessonId") ?? "",
        module: (searchParams.get("module") as LearningContext["module"]) ?? "",
        contentId: searchParams.get("contentId") ?? "",
    };

    // When the user enters from a "Hỏi AI" link with a new contentId, start a new conversation.
    const currentContentId = context.contentId;
    const lastContentIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (lastContentIdRef.current !== null && lastContentIdRef.current !== currentContentId) {
            setMessages([]);
            setConversationId(null);
            setMessage("");
        }
        lastContentIdRef.current = currentContentId;
    }, [currentContentId]);

    async function handleSend() {
        if (!message.trim() || loading) return;

        const userText = message.trim();
        setMessage("");
        setMessages((prev) => [...prev, { role: "user", text: userText }]);
        setLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userText,
                    context,
                    conversationId,
                }),
            });

            const data = await response.json();

            if (data.conversationId) {
                setConversationId(data.conversationId);
            }

            setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "Có lỗi xảy ra khi kết nối với AI Tutor." },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleNewChat() {
        setMessages([]);
        setConversationId(null);
        setMessage("");
    }

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">AI Tutor</h1>
                    <p className="mt-1 text-gray-600">Hỏi AI Tutor về tiếng Hàn</p>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={handleNewChat}
                        disabled={loading}
                        className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cuộc trò chuyện mới
                    </button>
                )}
            </div>

            <div className="mt-6 flex gap-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ví dụ: Từ 한국 dùng như thế nào?"
                    className="w-full rounded border px-4 py-2"
                    disabled={loading}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                />

                <button
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                    className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? "Đang trả lời..." : "Gửi"}
                </button>
            </div>

            {messages.length > 0 && (
                <div className="mt-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`rounded border p-4 ${
                                msg.role === "user"
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-white border-gray-200"
                            }`}
                        >
                            <h2 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-1">
                                {msg.role === "user" ? "Bạn" : "AI Tutor"}
                            </h2>
                            <div className="prose max-w-none text-gray-800">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="rounded border border-dashed border-gray-300 p-4 text-gray-500 italic">
                            AI Tutor đang suy nghĩ và trả lời...
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}