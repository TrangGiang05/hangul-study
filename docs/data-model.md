# Hangul Study — Data Model

## 1. Purpose

File này định nghĩa cấu trúc dữ liệu chính của Hangul Study.

Mục tiêu:

- Tách learning content khỏi UI.
- Giữ cấu trúc dữ liệu nhất quán.
- Dùng JSON source of truth cho curriculum content.
- Quản lý user state và progress qua PostgreSQL 18 + Prisma ORM 7.
- Giúp frontend, backend và AI Tutor sử dụng cùng một cách hiểu về dữ liệu.

Không thiết kế database quá phức tạp cho MVP.

---

# 2. Data Hierarchy

Cấu trúc learning content:

Course
→ Book
→ Lesson
→ Vocabulary
→ Grammar
→ Practice

Ví dụ:

Tiếng Hàn Tổng hợp Sơ cấp 1
→ Quyển 1
→ Bài 1 · 자기소개
→ Từ vựng
→ Ngữ pháp
→ Ôn tập

---

# 3. Course

Course đại diện cho một giáo trình hoặc khóa học.

### Fields

- id
- title
- description
- language
- targetLanguage
- status

### Example

id:
tong-hop

title:
Tiếng Hàn Tổng hợp Sơ cấp 1

language:
vi

targetLanguage:
ko

---

# 4. Book

Book đại diện cho một quyển trong Course.

### Fields

- id
- courseId
- title
- order
- description

### Example

id:
book-01

courseId:
tong-hop

title:
Quyển 1

order:
1

---

# 5. Lesson

Lesson đại diện cho một bài học.

### Fields

- id
- bookId
- title
- titleVi
- order
- vocabularyCount

### Example

id:
lesson-01

bookId:
book-01

title:
자기소개

titleVi:
Giới thiệu

order:
1

vocabularyCount:
55

Giá trị vocabularyCount phải phản ánh dữ liệu thực tế khi content được chuẩn bị.

---

# 6. Alphabet

Alphabet là dữ liệu dùng cho trang Bảng chữ cái.

### Categories

- basic-vowel
- compound-vowel
- basic-consonant
- double-consonant

### Fields

- id
- character
- type
- letterName
- letterNamePronunciation
- romanization
- example
- exampleMeaning
- notes

### Example

id:
A001

character:
ㅏ

type:
basic-vowel

romanization:
a

example:
가

exampleMeaning:
ga

notes:

Các field có thể để trống nếu nguồn content không cung cấp thông tin.

Không tự ý thêm dữ liệu không có trong nguồn content đã được chuẩn bị.

---

# 7. Vocabulary

Vocabulary là một từ vựng thuộc một Lesson.

### Fields

- id
- lessonId
- korean
- meaning
- partOfSpeech
- examples
- notes

### Example

id:
L01-V001

lessonId:
lesson-01

korean:
한국

meaning:
Hàn Quốc

partOfSpeech:
Danh từ

notes:

---

# 8. Vocabulary Example

Một vocabulary có thể có một hoặc nhiều example.

### Fields

- id
- vocabularyId
- korean
- translation
- notes

### Example

id:
L01-V001-E001

vocabularyId:
L01-V001

korean:
한국에 가요.

translation:
Tôi đi Hàn Quốc.

---

# 9. Grammar

Grammar là một điểm ngữ pháp thuộc một Lesson.

### Fields

- id
- lessonId
- title
- pattern
- meaning
- explanation
- notes
- examples

### Example

id:
L01-G001

lessonId:
lesson-01

title:
입니다

pattern:
N은/는 N입니다

meaning:
Là...

explanation:
Dùng để giới thiệu hoặc xác định danh từ.

notes:

---

# 10. Grammar Example

Một grammar item có thể có một hoặc nhiều example.

### Fields

- id
- grammarId
- korean
- translation
- notes

### Example

id:
L01-G001-E001

grammarId:
L01-G001

korean:
저는 학생입니다.

translation:
Tôi là học sinh.

---

# 11. Quiz Question

Quiz question đại diện cho một câu hỏi luyện tập.

### Fields

- id
- lessonId
- type
- question
- answer
- options
- explanation

### Supported Types

- multiple-choice
- typing
- fill-blank

Flashcard không nhất thiết phải lưu dưới dạng quiz question.

### Example

id:
L01-Q001

lessonId:
lesson-01

type:
multiple-choice

question:
한국 có nghĩa là gì?

answer:
Hàn Quốc

options:

- Hàn Quốc
- Nhật Bản
- Trung Quốc
- Việt Nam

explanation:

Explanation có thể được bổ sung khi content được chuẩn bị.

---

# 12. User

User đại diện cho người sử dụng website.

### Fields

- id
- name
- email
- createdAt
- updatedAt

MVP có thể chưa triển khai authentication đầy đủ.

Không cần xây Google Login trong MVP.

---

# 13. User Progress

UserProgress lưu tiến độ học.

### Fields

- id
- userId
- lessonId
- status
- progress
- lastStudiedAt

### Status

Có thể gồm:

- not-started
- in-progress
- completed

### Example

userId:
user-001

lessonId:
lesson-01

status:
in-progress

progress:
65

---

# 14. User Vocabulary

UserVocabulary lưu trạng thái học của từng từ.

### Fields

- id
- userId
- vocabularyId
- status
- reviewCount
- lastReviewedAt

### Status

- unknown
- learning
- known

MVP chỉ cần trạng thái cơ bản.

Không triển khai thuật toán SRS nâng cao.

---

# 15. Chat Session

ChatSession đại diện cho một phiên trò chuyện với AI Tutor.

### Fields

- id
- userId
- courseId
- bookId
- lessonId
- contextType
- contextId
- createdAt
- updatedAt

### Context Types

Có thể gồm:

- lesson
- vocabulary
- grammar
- practice

---

# 16. Chat Message

ChatMessage đại diện cho một tin nhắn trong AI Tutor.

### Fields

- id
- sessionId
- role
- content
- createdAt

### Role

- user
- assistant

### Example

sessionId:
session-001

role:
user

content:
Tại sao dùng 입니다 ở đây?

---

# 17. Relationships

Các quan hệ chính:

Course
1
→ N
Book

Book
1
→ N
Lesson

Lesson
1
→ N
Vocabulary

Lesson
1
→ N
Grammar

Lesson
1
→ N
QuizQuestion

Vocabulary
1
→ N
VocabularyExample

Grammar
1
→ N
GrammarExample

User
1
→ N
UserProgress

User
1
→ N
UserVocabulary

User
1
→ N
ChatSession

ChatSession
1
→ N
ChatMessage

---

# 18. Content IDs

ID phải ổn định và dễ đọc.

Quy ước gợi ý:

Course:

course-id

Book:

book-01

Lesson:

lesson-01

Vocabulary:

L01-V001

Grammar:

L01-G001

Quiz:

L01-Q001

Vocabulary Example:

L01-V001-E001

Grammar Example:

L01-G001-E001

ID không nên phụ thuộc vào vị trí UI.

---

# 19. Lesson Content Structure

Một Lesson có thể được xem như:

Lesson
├── Vocabulary
│   ├── Vocabulary item
│   ├── Vocabulary item
│   └── Vocabulary item
│
├── Grammar
│   ├── Grammar item
│   └── Grammar item
│
└── Practice
    ├── Quiz question
    └── Quiz question

---

# 20. Initial JSON Structure

Trong giai đoạn local development, dữ liệu có thể được tổ chức:

data/
└── korean/
    └── tong-hop/
        ├── course.json
        ├── alphabet.json
        │
        ├── lessons/
        │   ├── lesson-01.json
        │   └── lesson-02.json
        │
        ├── vocabulary/
        │   ├── lesson-01.json
        │   └── lesson-02.json
        │
        ├── grammar/
        │   ├── lesson-01.json
        │   └── lesson-02.json
        │
        └── quizzes/
            ├── lesson-01.json
            └── lesson-02.json

Chỉ tạo file cho lesson thực sự có dữ liệu.

Không cần tạo trước toàn bộ lesson.

---

# 21. Example Lesson Data

Lesson:

lesson-01

title:

자기소개

titleVi:

Giới thiệu

order:

1

---

# 22. Example Vocabulary Data

Một vocabulary item:

id:
L01-V001

lessonId:
lesson-01

korean:
한국

meaning:
Hàn Quốc

partOfSpeech:
Danh từ

examples:

Example:

korean:
한국에 가요.

translation:
Tôi đi Hàn Quốc.

notes:

---

# 23. Example Grammar Data

Một grammar item:

id:
L01-G001

lessonId:
lesson-01

title:
입니다

pattern:
N은/는 N입니다

meaning:
Là...

explanation:
Dùng để giới thiệu hoặc xác định danh từ.

examples:

Example:

korean:
저는 학생입니다.

translation:
Tôi là học sinh.

notes:

---

# 24. Content Source

Learning content hiện tại được chuẩn bị từ:

Hangul_Study_Lesson_01_updated.xlsx

Các sheet:

- Alphabet
- Vocabulary
- Grammar

Excel là content preparation source.

Excel không phải database runtime.

---

# 25. Content Accuracy Rule

Learning content phải giữ đúng nguồn đã được chuẩn bị.

Không tự ý:

- Thay đổi nghĩa
- Thêm từ
- Thêm ngữ pháp
- Thêm ví dụ
- Thêm giải thích
- Thay đổi cấu trúc bài

nếu chưa có nguồn hoặc chưa được project owner xác nhận.

Nếu một field không có dữ liệu:

Có thể để trống.

Không tự suy đoán để lấp dữ liệu.

---

# 26. Data Validation

Khi đưa content vào application cần kiểm tra:

- ID không trùng
- lessonId tồn tại
- bookId tồn tại
- courseId tồn tại
- Vocabulary có Korean word
- Grammar có title
- Quiz có answer
- Example có content hợp lệ

Invalid data phải được phát hiện trước khi đưa vào production.

---

# 27. Phase 8 Database Architecture (PostgreSQL 18 + Prisma ORM 7)

Trong kiến trúc Hangul Study, toàn bộ nội dung giáo trình (Curriculum) KHÔNG chuyển vào database tables mà được duy trì vĩnh viễn dưới dạng JSON source of truth trong `data/korean/`.

Database PostgreSQL được quản lý duy nhất bởi Next.js qua Prisma ORM, chỉ phục vụ cho User State Layer gồm 6 bảng:

### 1. `users`
- Lưu trữ danh tính người dùng, email, mật khẩu băm, profile.
- Cột chính: `id` (UUID PK), `email`, `password_hash`, `email_verified_at`, `display_name`, `avatar_url`, `created_at`, `updated_at`.

### 2. `user_lesson_progress`
- Theo dõi tiến độ học từng bài học.
- Khóa chính tổng hợp (Composite PK): `(user_id, course_id, book_id, lesson_id)`.
- Cột chính: `status` ('in_progress' | 'completed'), `completed_at`, `last_accessed_at`, `created_at`, `updated_at`.

### 3. `user_item_progress`
- Theo dõi mức độ làm chủ từng từ vựng hoặc điểm ngữ pháp.
- Khóa chính tổng hợp (Composite PK): `(user_id, course_id, book_id, lesson_id, item_type, item_id)`.
- Cột chính: `item_type` ('vocabulary' | 'grammar'), `item_id` (application reference tới JSON), `mastered_at`, `created_at`, `updated_at`.

### 4. `practice_attempts`
- Lưu lịch sử các lần luyện tập (Flashcard, Quiz, Typing).
- Cột chính: `id` (UUID PK), `user_id`, `course_id`, `book_id`, `lesson_id`, `mode`, `score`, `total_questions`, `completed_at`.

### 5. `ai_conversations`
- Lưu trữ các phiên hội thoại với AI Tutor theo ngữ cảnh học tập.
- Cột chính: `id` (UUID PK), `user_id`, `title`, `course_id`, `book_id`, `lesson_id`, `module`, `content_id`, `created_at`, `updated_at`.

### 6. `ai_messages`
- Lưu trữ từng tin nhắn trong phiên hội thoại AI Tutor.
- Cột chính: `id` (UUID PK), `conversation_id`, `role` ('user' | 'assistant' | 'system'), `content`, `created_at`.

*Quy tắc tham chiếu:* Các định danh curriculum (`course_id`, `book_id`, `lesson_id`, `item_id`) được lưu dưới dạng application-level references và được validate với JSON content registry trước khi persist.

---

# 28. Database Principle

Database phải phản ánh nhu cầu lưu trữ trạng thái người dùng (User State).

Phân tách rành mạch:
- Content Layer: JSON files trong `data/korean/` là source of truth cố định, version-controlled qua Git.
- User State Layer: PostgreSQL lưu trữ thông tin người dùng, tiến độ học, lịch sử ôn tập và AI chat history.

Không tạo bảng nội dung (courses, books, lessons, vocabulary, grammar) trong PostgreSQL.

Mỗi table phải có mục đích rõ ràng và chỉ Next.js được quyền đọc/ghi. FastAPI là AI service phi trạng thái và không truy cập database.

---

# 29. AI Data Usage

AI Tutor có thể nhận dữ liệu context từ các entity:

Course
Book
Lesson
Vocabulary
Grammar
Example

Ví dụ:

contextType:
grammar

contextId:
L01-G001

AI request có thể chứa:

Lesson:
Bài 1 · 자기소개

Grammar:
입니다

Pattern:
N은/는 N입니다

Question:
Tại sao dùng 입니다?

AI response được trả về cho Next.js.

---

# 30. Data Model Principles

### Principle 1 — Stable IDs

ID phải ổn định.

### Principle 2 — Separate Content

Learning content phải tách khỏi UI.

### Principle 3 — Source Accuracy

Không tự tạo content khi nguồn không cung cấp.

### Principle 4 — Simple MVP

Chỉ lưu dữ liệu cần thiết cho MVP.

### Principle 5 — Extensible

Cấu trúc phải cho phép thêm lesson và content sau này.

### Principle 6 — Content & User State Separation

Curriculum content là tĩnh và bất biến, được lưu trữ trong JSON dưới dạng source of truth duy nhất.
Database (PostgreSQL + Prisma) chỉ dành riêng để lưu trữ user state, progress, practice attempts và AI conversation history.

---

# 31. Data Model Summary

Core learning structure:

Course
→ Book
→ Lesson
→ Vocabulary
→ Vocabulary Examples

Course
→ Book
→ Lesson
→ Grammar
→ Grammar Examples

Lesson
→ Quiz Questions

User Data Layer (PostgreSQL 18 + Prisma ORM 7):

User
├── Lesson Progress (user_lesson_progress)
├── Item Mastery (user_item_progress)
├── Practice Attempts (practice_attempts)
└── AI Conversations (ai_conversations)
    └── AI Messages (ai_messages)

Curriculum Content source of truth:

Excel
→ JSON (`data/korean/`)
→ Content Adapters (`frontend/lib/content/`)
→ Next.js UI & FastAPI AI Tools

Application User Data flow:

Next.js
→ Prisma ORM
→ PostgreSQL 18