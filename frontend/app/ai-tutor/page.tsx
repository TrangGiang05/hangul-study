"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "next/navigation";
import type { LearningContext } from "../../lib/ai/context";

export default function AiTutorPage() {
    const [message, setMessage] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const searchParams = useSearchParams();

    // Reconstruct the structured learning context from URL query parameters.
    // All values default to empty strings so the page works when opened
    // directly (no params) as a general-purpose AI Tutor.
    const context: LearningContext = {
        courseId: searchParams.get("courseId") ?? "",
        bookId: searchParams.get("bookId") ?? "",
        lessonId: searchParams.get("lessonId") ?? "",
        module: (searchParams.get("module") as LearningContext["module"]) ?? "",
        contentId: searchParams.get("contentId") ?? "",
    };

    async function handleSend() {
        if (!message.trim() || loading) return;

        setLoading(true);
        setAnswer("");

        try {
            const response = await fetch("http://127.0.0.1:8000/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    context,
                }),
            });

            const data = await response.json();

            setAnswer(data.answer);
        } catch {
            setAnswer("Có lỗi xảy ra khi kết nối với AI Tutor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold">AI Tutor</h1>

            <p className="mt-2">Hỏi AI Tutor về tiếng Hàn</p>

            <div className="mt-6 flex gap-2">
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ví dụ: Từ 한국 dùng như thế nào?"
                    className="w-full rounded border px-4 py-2"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                />

                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="rounded bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "Đang trả lời..." : "Gửi"}
                </button>
            </div>

            {answer && (
                <div className="mt-6 rounded border p-4">
                    <h2 className="font-bold">AI Tutor trả lời:</h2>
                    <div className="mt-2">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                    </div>
                </div>
            )}
        </main>
    );
}