-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "email_verified_at" TIMESTAMP(3),
    "display_name" VARCHAR(100),
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lesson_progress" (
    "user_id" UUID NOT NULL,
    "course_id" VARCHAR(50) NOT NULL,
    "book_id" VARCHAR(50) NOT NULL,
    "lesson_id" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "last_accessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lesson_progress_pkey" PRIMARY KEY ("user_id","course_id","book_id","lesson_id")
);

-- CreateTable
CREATE TABLE "user_item_progress" (
    "user_id" UUID NOT NULL,
    "course_id" VARCHAR(50) NOT NULL,
    "book_id" VARCHAR(50) NOT NULL,
    "lesson_id" VARCHAR(50) NOT NULL,
    "item_type" VARCHAR(20) NOT NULL,
    "item_id" VARCHAR(50) NOT NULL,
    "mastered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_item_progress_pkey" PRIMARY KEY ("user_id","course_id","book_id","lesson_id","item_type","item_id")
);

-- CreateTable
CREATE TABLE "practice_attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "course_id" VARCHAR(50) NOT NULL,
    "book_id" VARCHAR(50) NOT NULL,
    "lesson_id" VARCHAR(50) NOT NULL,
    "mode" VARCHAR(50) NOT NULL,
    "score" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

-- AddCheckConstraints
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_score_nonnegative" CHECK ("score" >= 0);
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_total_questions_positive" CHECK ("total_questions" > 0);
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_score_lte_total" CHECK ("score" <= "total_questions");

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255),
    "course_id" VARCHAR(50),
    "book_id" VARCHAR(50),
    "lesson_id" VARCHAR(50),
    "module" VARCHAR(50),
    "content_id" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_lesson_progress_user_id_course_id_book_id_idx" ON "user_lesson_progress"("user_id", "course_id", "book_id");

-- CreateIndex
CREATE INDEX "user_item_progress_user_id_course_id_book_id_lesson_id_item_idx" ON "user_item_progress"("user_id", "course_id", "book_id", "lesson_id", "item_type");

-- CreateIndex
CREATE INDEX "practice_attempts_user_id_completed_at_idx" ON "practice_attempts"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "practice_attempts_user_id_course_id_book_id_lesson_id_idx" ON "practice_attempts"("user_id", "course_id", "book_id", "lesson_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_updated_at_idx" ON "ai_conversations"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "ai_messages_conversation_id_created_at_id_idx" ON "ai_messages"("conversation_id", "created_at", "id");

-- AddForeignKey
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_item_progress" ADD CONSTRAINT "user_item_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
