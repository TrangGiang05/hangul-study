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
import { chatWithAITutor, getRecentAITutorConversation, createNewAITutorConversation } from "../../app/actions/ai";
import { useSession } from "../../lib/auth-client";
import { useEffect } from "react";
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
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeContextRef.current = activeContext;
    conversationIdRef.current = conversationId;
  }, [activeContext, conversationId]);

  const loadingRef = useRef<boolean>(false);
  // Remove render-phase assignment of loadingRef to prevent overriding the synchronous lock

  const { data: session, isPending: isAuthPending } = useSession();
  const previousUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthPending) return;

    const currentUserId = session?.user?.id;
    const previousUserId = previousUserIdRef.current;

    if (currentUserId !== previousUserId) {
      if (previousUserId !== undefined) {
        // Transition occurred (logout or login as different user) -> Clear state
        setMessages([]);
        setConversationId(null);
        setInputMessage("");
      }

      previousUserIdRef.current = currentUserId;

      // If logged in, fetch persisted history
      if (currentUserId) {
        getRecentAITutorConversation().then((res) => {
          if (res.success && res.data) {
            setConversationId(res.data.conversationId);
            setActiveContext(res.data.context);
            setMessages(res.data.messages);
          }
        });
      }
    }
  }, [session, isAuthPending]);

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
        setLoading(true);
        
        createNewAITutorConversation(resolved).then((res) => {
          if (res.success && res.data) {
            setConversationId(res.data.conversationId);
          }
          setLoading(false);
        });
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

  const newChat = useCallback(async () => {
    setMessages([]);
    setConversationId(null);
    setInputMessage("");
    setLoading(true);
    
    try {
      const res = await createNewAITutorConversation(activeContextRef.current);
      if (res.success && res.data) {
        setConversationId(res.data.conversationId);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (customText?: string) => {
      const textToSend = (customText ?? inputMessage).trim();
      if (!textToSend || loadingRef.current) return;

      // Synchronously acquire the lock before any async operation or render yields
      loadingRef.current = true;

      if (!customText) {
        setInputMessage("");
      }
      setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
      setLoading(true);

      try {
        const data = await chatWithAITutor({
          message: textToSend,
          context: activeContextRef.current,
          conversationId: conversationIdRef.current,
        });

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
        loadingRef.current = false;
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
