import pg from "pg";
import fs from "node:fs";
import path from "node:path";

let pool = null;

export function getPool() {
  if (!pool) {
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        for (const line of envContent.split("\n")) {
          const match = line.match(/^DATABASE_URL=(.+)$/);
          if (match) {
            dbUrl = match[1].trim().replace(/^["']|["']$/g, "");
            break;
          }
        }
      }
    }
    pool = new pg.Pool({ connectionString: dbUrl });
  }
  return pool;
}

export async function getUserByEmail(email) {
  const p = getPool();
  const res = await p.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function getUserItemProgresses(userId, itemType) {
  const p = getPool();
  const res = await p.query(
    'SELECT * FROM user_item_progress WHERE user_id = $1 AND item_type = $2',
    [userId, itemType]
  );
  return res.rows;
}

export async function getUserLessonProgress(userId, courseId, bookId, lessonId) {
  const p = getPool();
  const res = await p.query(
    'SELECT * FROM user_lesson_progress WHERE user_id = $1 AND course_id = $2 AND book_id = $3 AND lesson_id = $4',
    [userId, courseId, bookId, lessonId]
  );
  return res.rows[0] || null;
}

export async function getUserPracticeAttempts(userId) {
  const p = getPool();
  const res = await p.query(
    'SELECT * FROM practice_attempts WHERE user_id = $1 ORDER BY completed_at DESC',
    [userId]
  );
  return res.rows;
}

export async function getUserChatMessages(userId) {
  const p = getPool();
  const res = await p.query(
    `SELECT m.* FROM ai_messages m
     JOIN ai_conversations c ON m.conversation_id = c.id
     WHERE c.user_id = $1
     ORDER BY m.created_at ASC`,
    [userId]
  );
  return res.rows;
}

export async function getUserConversations(userId) {
  const p = getPool();
  const res = await p.query(
    'SELECT * FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return res.rows;
}

export async function getConversationMessages(conversationId) {
  const p = getPool();
  const res = await p.query(
    'SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );
  return res.rows;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
