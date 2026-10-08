"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { useAITutor } from "./AITutorContext";
import { AIMessageAudio } from "./AIMessageAudio";
import { stopSpeech } from "../../lib/ai/tts";

const QUICK_ACTION_CHIPS: Record<string, string[]> = {
  vocabulary: [
    "Đặt 2 câu ví dụ thực tế",
    "Lưu ý cách phát âm & nối âm",
    "Từ hay đi kèm",
  ],
  practice: [
    "Phân tích chi tiết lỗi sai của mình",
    "Mẹo nhớ để không bị nhầm lẫn",
  ],
  grammar: [
    "Giải thích chi tiết ngữ pháp này",
    "Cho mình 2 câu ví dụ thực tế",
    "Lưu ý khi sử dụng ngữ pháp này",
  ],
  default: [
    "Giải thích chi tiết mục này",
    "Cho mình 2 câu ví dụ tiếng Hàn",
    "Có điểm lưu ý nào cần nhớ?",
  ],
};

export function AITutorDrawer() {
  const {
    isOpen,
    closeAITutor,
    activeContext,
    messages,
    loading,
    inputMessage,
    setInputMessage,
    sendMessage,
    newChat,
  } = useAITutor();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        stopSpeech();
        closeAITutor();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeAITutor]);

  // Stop TTS speech when drawer closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
    }
    return () => {
      stopSpeech();
    };
  }, [isOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Focus textarea when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format active context badge
  const moduleLabels: Record<string, string> = {
    vocabulary: "Từ vựng",
    grammar: "Ngữ pháp",
    practice: "Luyện tập",
    lesson: "Bài học",
  };
  const moduleLabel = moduleLabels[activeContext.module] || "Chung";
  const lessonNumber = activeContext.lessonId?.replace("lesson-", "Bài ") || "Bài 1";

  const currentChips =
    QUICK_ACTION_CHIPS[activeContext.module] || QUICK_ACTION_CHIPS.default;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeAITutor}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <aside className="w-screen max-w-full md:w-[400px] lg:w-[440px] h-screen h-[100dvh] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 relative rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/assets/mascot/pengul.png"
                  alt="Pengul"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">AI Tutor</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {lessonNumber} · {moduleLabel}
                  </span>
                  {activeContext.contentId && (
                    <span className="text-xs text-gray-500 font-mono">
                      #{activeContext.contentId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  newChat();
                }}
                disabled={loading}
                title="Bắt đầu cuộc trò chuyện mới"
                className="rounded-lg p-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Mới</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  closeAITutor();
                }}
                aria-label="Đóng AI Tutor"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </header>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8 px-2 space-y-4">
                <div className="h-16 w-16 relative">
                  <Image
                    src="/assets/mascot/pengul.png"
                    alt="Pengul"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Xin chào! Mình là AI Tutor.</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                    Được tích hợp cùng giáo trình tiếng Hàn của bạn. Hãy hỏi bất cứ điều gì về bài học này nhé!
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Gợi ý câu hỏi</p>
                  {currentChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => sendMessage(chip)}
                      className="w-full text-left rounded-xl border border-gray-200 bg-white p-2.5 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      💡 {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[11px] font-semibold text-gray-400 mb-1 px-1">
                    {msg.role === "user" ? "Bạn" : "AI Tutor"}
                  </span>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-2xs ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-xs"
                        : msg.isError
                        ? "bg-red-50 border border-red-100 text-red-900 rounded-tl-xs"
                        : "bg-white border border-gray-200 text-gray-900 rounded-tl-xs"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none text-inherit prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.role === "assistant" && !msg.isError && <AIMessageAudio text={msg.text} />}
                    {msg.isError && (
                      <div className="mt-2 flex">
                        <button
                          type="button"
                          onClick={() => {
                            const idx = messages.indexOf(msg);
                            const userMsg = messages[idx - 1]?.text;
                            if (userMsg) {
                              sendMessage(userMsg, true);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors border border-red-200"
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
              ))
            )}

            {loading && (
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 px-1">AI Tutor</span>
                <div className="rounded-2xl rounded-tl-xs bg-white border border-gray-200 px-4 py-3 text-xs text-gray-500 shadow-2xs flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>AI Tutor đang suy nghĩ và trả lời...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <footer className="border-t border-gray-200 bg-white p-3 space-y-2">
            {/* Horizontal Quick-Action Chip Row */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5 whitespace-nowrap"
              style={{ scrollbarWidth: "none" }}
              role="group"
              aria-label="Gợi ý câu hỏi nhanh"
            >
              {currentChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(chip)}
                  className="inline-flex shrink-0 items-center rounded-full border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-xs font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50/50 p-1.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  rows={2}
                  disabled={loading}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Hỏi AI về từ vựng, ngữ pháp..."
                  className="w-full resize-none border-0 bg-transparent px-2.5 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600"
                  aria-label="Gửi tin nhắn"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
                <span>Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> xuống dòng</span>
              </div>
            </form>
          </footer>
        </aside>
      </div>
    </div>
  );
}
