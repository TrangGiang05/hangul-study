"use server";

import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import prisma from "../../lib/prisma";
import type { LearningContext } from "../../lib/ai/context";

import crypto from "crypto";

type ChatRequestInput = {
  message: string;
  context: LearningContext;
  conversationId: string | null;
};

function generateDeterministicUuid(seed: string): string {
  const hash = crypto.createHash("md5").update(seed).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export async function chatWithAITutor(input: ChatRequestInput) {
  const { message, context, conversationId } = input;

  // 1. Get authenticated user securely from Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  let validConversationId = conversationId;

  // Security Check 1: Conversation Ownership
  if (userId && validConversationId) {
    const existingConv = await prisma.aIConversation.findUnique({
      where: { id: validConversationId },
      select: { userId: true },
    });
    // If it exists and belongs to someone else, do not trust it
    if (existingConv && existingConv.userId !== userId) {
      validConversationId = null;
    }
  }

  // 2. Call FastAPI
  try {
    const response = await fetch("http://127.0.0.1:8000/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        context,
        conversationId: validConversationId || null,
      }),
    });

    if (!response.ok) {
      let errorDetail = "Dịch vụ AI Tutor hiện đang bận hoặc không thể kết nối. Vui lòng thử lại sau.";
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData.detail === "string") {
          errorDetail = errorData.detail;
        }
      } catch {
        // ignore parsing error
      }
      return { ok: false, error: errorDetail };
    }

    const data = await response.json();
    // data: { answer: string, conversationId: string }

    // 3. Persist if authenticated
    if (userId) {
      try {
        // Upsert the conversation
        await prisma.aIConversation.upsert({
          where: { id: data.conversationId },
          create: {
            id: data.conversationId,
            userId,
            courseId: context.courseId || null,
            bookId: context.bookId || null,
            lessonId: context.lessonId || null,
            module: context.module || null,
            contentId: context.contentId || null,
            title: "Chat",
          },
          update: {
            updatedAt: new Date(),
          },
        });

        // Security Check 2: Duplicate message prevention using deterministic IDs based on turn count
        const messageCount = await prisma.aIMessage.count({
          where: { conversationId: data.conversationId },
        });

        const turnIndex = Math.floor(messageCount / 2);
        const userMsgId = generateDeterministicUuid(`${data.conversationId}:user:${turnIndex}`);
        const assistantMsgId = generateDeterministicUuid(`${data.conversationId}:assistant:${turnIndex}`);

        const now = Date.now();

        await prisma.aIMessage.createMany({
          data: [
            {
              id: userMsgId,
              conversationId: data.conversationId,
              role: "user",
              content: message,
              createdAt: new Date(now - 10), // Ensures user message is always before assistant message
            },
            {
              id: assistantMsgId,
              conversationId: data.conversationId,
              role: "assistant",
              content: data.answer,
              createdAt: new Date(now),
            },
          ],
          skipDuplicates: true,
        });
      } catch (err) {
        console.error("Failed to persist AI conversation:", err);
        // We don't throw here to still allow the user to see the chat response,
        // but in a strict system we might handle this differently.
      }
    }

    return { ok: true, answer: data.answer, conversationId: data.conversationId };
  } catch (err) {
    console.error("Failed to connect to AI Tutor:", err);
    return { ok: false, error: "Dịch vụ AI Tutor hiện đang bận hoặc không thể kết nối. Vui lòng thử lại sau." };
  }
}

export async function getRecentAITutorConversation() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return { success: true, data: null }; // guest or not logged in
  }

  try {
    const recentConv = await prisma.aIConversation.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        }
      }
    });

    if (!recentConv) {
      return { success: true, data: null };
    }

    return { 
      success: true, 
      data: {
        conversationId: recentConv.id,
        context: {
          courseId: recentConv.courseId || "tong-hop",
          bookId: recentConv.bookId || "book-01",
          lessonId: recentConv.lessonId || "lesson-01",
          module: (recentConv.module as import("../../lib/ai/context").LearningModule) || "",
          contentId: recentConv.contentId || "",
        },
        messages: recentConv.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          text: m.content,
        }))
      } 
    };
  } catch (error) {
    console.error("Failed to fetch recent AI conversation:", error);
    return { success: false, error: "Database error" };
  }
}

export async function createNewAITutorConversation(context: LearningContext) {
  // Identify current authenticated user
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 1️⃣ Look for an existing *empty* conversation (no AIMessage rows) belonging to this user
  const existingEmpty = await prisma.aIConversation.findFirst({
    where: {
      userId,
      messages: { none: {} }, // ensures zero messages
    },
    orderBy: { updatedAt: "desc" }, // most recently touched empty conversation
  });

  if (existingEmpty) {
    // Refresh its updatedAt so it becomes the most recent conversation
    await prisma.aIConversation.update({
      where: { id: existingEmpty.id },
      data: { updatedAt: new Date() },
    });
    return { success: true, data: { conversationId: existingEmpty.id } };
  }

  // 2️⃣ No suitable empty conversation – create a brand‑new one
  const newId = crypto.randomUUID();
  try {
    const newConv = await prisma.aIConversation.create({
      data: {
        id: newId,
        userId,
        courseId: context.courseId || null,
        bookId: context.bookId || null,
        lessonId: context.lessonId || null,
        module: context.module || null,
        contentId: context.contentId || null,
        title: "Chat",
      },
    });
    return { success: true, data: { conversationId: newConv.id } };
  } catch (error) {
    console.error("Failed to create new AI conversation:", error);
    return { success: false, error: "Database error" };
  }
}
