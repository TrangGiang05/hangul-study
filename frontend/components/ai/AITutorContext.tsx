"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LearningContext } from "../../lib/ai/context";

export type Message = {
  role: "user" | "assistant";
  text: string;
};

export type AITutorContextType = {
  isOpen: boolean;
  activeContext: LearningContext;
  messages: Message[];
  conversationId: string | null;
  loading: boolean;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  openAITutor: (
    incomingContext?: Partial<LearningContext>,
    initialMessage?: string,
    openDrawer?: boolean
  ) => void;
  closeAITutor: () => void;
  newChat: () => void;
  sendMessage: (customText?: string) => Promise<void>;
};

const defaultContext: LearningContext = {
  courseId: "tong-hop",
  bookId: "book-01",
  lessonId: "lesson-01",
  module: "",
  contentId: "",
};

const AITutorContext = createContext<AITutorContextType | null>(null);

export function AITutorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] = useState<LearningContext>(defaultContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const activeContextRef = useRef<LearningContext>(defaultContext);
  activeContextRef.current = activeContext;

  const conversationIdRef = useRef<string | null>(null);
  conversationIdRef.current = conversationId;

  const loadingRef = useRef<boolean>(false);
  loadingRef.current = loading;

  const openAITutor = useCallback(
    (
      incomingContext?: Partial<LearningContext>,
      initialMessage?: string,
      openDrawer: boolean = true
    ) => {
      if (openDrawer) {
        setIsOpen(true);
      }
      if (!incomingContext) return;

      const current = activeContextRef.current;
      const resolved: LearningContext = {
        courseId: incomingContext.courseId ?? current.courseId ?? "tong-hop",
        bookId: incomingContext.bookId ?? current.bookId ?? "book-01",
        lessonId: incomingContext.lessonId ?? current.lessonId ?? "lesson-01",
        module: incomingContext.module ?? current.module ?? "",
        contentId: incomingContext.contentId ?? "",
      };

      // Conversation reset rule:
      // If the user explicitly clicks "Hỏi AI" from another learning item
      // (different contentId or different module), intentionally start a new conversation.
      const isNewItem =
        (resolved.contentId && resolved.contentId !== current.contentId) ||
        (resolved.module && resolved.module !== current.module);

      if (isNewItem) {
        setMessages([]);
        setConversationId(null);
        setInputMessage("");
      }

      setActiveContext(resolved);

      if (initialMessage) {
        setInputMessage(initialMessage);
      }
    },
    []
  );

  const closeAITutor = useCallback(() => {
    setIsOpen(false);
  }, []);

  const newChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setInputMessage("");
  }, []);

  const sendMessage = useCallback(
    async (customText?: string) => {
      const textToSend = (customText ?? inputMessage).trim();
      if (!textToSend || loadingRef.current) return;

      if (!customText) {
        setInputMessage("");
      }
      setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
      setLoading(true);

      try {
        const response = await fetch("http://127.0.0.1:8000/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: textToSend,
            context: activeContextRef.current,
            conversationId: conversationIdRef.current,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Có lỗi xảy ra khi kết nối với AI Tutor. Vui lòng thử lại sau.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [inputMessage]
  );

  return (
    <AITutorContext.Provider
      value={{
        isOpen,
        activeContext,
        messages,
        conversationId,
        loading,
        inputMessage,
        setInputMessage,
        openAITutor,
        closeAITutor,
        newChat,
        sendMessage,
      }}
    >
      {children}
    </AITutorContext.Provider>
  );
}

export function useAITutor() {
  const context = useContext(AITutorContext);
  if (!context) {
    throw new Error("useAITutor must be used within an AITutorProvider");
  }
  return context;
}
