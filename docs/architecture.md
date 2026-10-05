# Hangul Study — Architecture

## 1. Architecture Goal

Hangul Study sử dụng kiến trúc đơn giản, rõ ràng và có khả năng mở rộng.

Mục tiêu:

- Dễ phát triển MVP
- Dễ học và bảo trì
- Tách UI khỏi learning data
- Tách AI service khỏi web application
- Quản lý user state và progress qua PostgreSQL + Prisma
- Có thể deploy thành sản phẩm thực tế

Không xây dựng kiến trúc quá phức tạp cho MVP.

---

# 2. Technology Stack

## Frontend / Web Application

- Next.js
- TypeScript
- React
- App Router
- CSS

Next.js chịu trách nhiệm chính cho website và các chức năng backend thông thường của sản phẩm.

---

## AI Backend

- Python
- FastAPI

FastAPI chịu trách nhiệm cho các chức năng AI.

Ví dụ:

- AI Tutor
- Giải thích vocabulary
- Giải thích grammar
- Sửa câu tiếng Hàn
- Sinh ví dụ
- Learning Q&A

---

## Database

- PostgreSQL 18
- Prisma ORM 7

PostgreSQL kết hợp với Prisma ORM được Next.js sử dụng để lưu trữ persistent user data.

Curriculum content (Alphabet, Course, Book, Lesson, Vocabulary, Grammar) là read-only và được duy trì vĩnh viễn dưới dạng JSON source of truth (`data/korean/`).

Database chỉ lưu trữ dữ liệu người dùng (User State Layer):

- users
- user_lesson_progress
- user_item_progress
- practice_attempts
- ai_conversations
- ai_messages

---

# 3. High-Level Architecture

Browser
↓
Next.js
├── UI / Pages
├── Components
├── Server Actions / Route Handlers
└── Prisma ORM (Database Access)
    ↓
    PostgreSQL (User State)

Next.js
↓
FastAPI
↓
Gemini API

FastAPI chỉ chịu trách nhiệm cho AI-related functionality và hoàn toàn KHÔNG truy cập PostgreSQL.

---

# 4. Responsibilities

## 4.1 Next.js

Next.js là application chính của Hangul Study.

Responsibilities:

- Render UI
- Routing
- Navigation
- Course pages
- Book pages
- Lesson pages
- Vocabulary pages
- Grammar pages
- Practice pages
- Review pages
- Settings
- User-facing AI Tutor interface
- Authentication khi được triển khai
- Gọi database
- Gọi FastAPI AI service

Next.js là nơi điều phối learning experience.

---

# 5. FastAPI

FastAPI là AI service.

Responsibilities:

- Nhận AI request
- Nhận learning context
- Chuẩn bị prompt
- Gọi LLM provider
- Xử lý AI response
- Trả kết quả về Next.js

FastAPI không chịu trách nhiệm render website.

FastAPI cũng không nên tự quản lý toàn bộ application logic của Hangul Study.

---

# 6. Database Responsibility

Trong kiến trúc Phase 8:

Next.js là service duy nhất kết nối và quản lý PostgreSQL thông qua Prisma ORM.

FastAPI là AI backend phi trạng thái (stateless AI service), KHÔNG kết nối hay truy cập PostgreSQL.

Ví dụ:

Next.js
→ Prisma ORM
→ PostgreSQL (User progress, Practice history, AI chat history)

Next.js
→ FastAPI
→ Gemini API

Điều này giúp đảm bảo quy tắc Single Writer: chỉ có Next.js quản lý user data và database operations, tránh xung đột logic giữa hai runtime.

Nếu sau này AI service cần database riêng, quyết định đó sẽ được đưa ra ở một phase khác.

---

# 7. Normal Data Flow

Ví dụ người dùng mở Lesson 1.

Browser
↓
Next.js
↓
Database / learning data
↓
Lesson data
↓
Next.js
↓
Browser

Ví dụ:

User mở:

Bài 1 · 자기소개

Next.js lấy:

- Lesson information
- Vocabulary
- Grammar
- Practice data

Sau đó render giao diện cho người dùng.

---

# 8. AI Data Flow

Ví dụ người dùng đang học grammar:

입니다

và nhấn:

Hỏi AI

Flow:

Browser
↓
Next.js
↓
FastAPI
↓
LLM API
↓
FastAPI
↓
Next.js
↓
Browser

Request nên chứa context cần thiết.

Ví dụ:

Course:
Tiếng Hàn Tổng hợp Sơ cấp 1

Book:
Quyển 1

Lesson:
Bài 1 · 자기소개

Type:
Grammar

Grammar:
입니다

User question:
"Tại sao dùng 입니다 ở đây?"

FastAPI sử dụng context này để tạo AI request phù hợp.

---

# 9. AI Context Principle

AI Tutor phải có context.

Không nên gửi một câu hỏi hoàn toàn không có thông tin về bài học nếu người dùng đang hỏi từ một learning item cụ thể.

Context có thể gồm:

- Course
- Book
- Lesson
- Vocabulary
- Grammar
- Example sentence
- User question

Ví dụ:

Lesson:
Bài 1

Grammar:
입니다

Example:
저는 학생입니다.

Question:
"Giải thích câu này cho tôi."

AI nên hiểu người dùng đang hỏi về nội dung của Lesson 1.

---

# 10. Project Structure

Cấu trúc project dự kiến:

hangul-study/
├── .skills/
│   └── hangul-study/
│       └── SKILL.md
│
├── docs/
│   ├── product-spec.md
│   ├── architecture.md
│   └── data-model.md
│
├── frontend/
│
├── backend/
│
├── database/
│
├── README.md
│
└── .gitignore

---

# 11. Frontend Structure

Frontend sử dụng Next.js.

Cấu trúc dự kiến:

frontend/
├── app/
├── components/
├── data/
├── lib/
├── types/
├── public/
└── package.json

Có thể mở rộng structure khi project lớn hơn.

Không tạo quá nhiều folder khi chưa cần thiết.

---

# 12. Frontend Responsibilities

## app/

Chứa routes và page-level UI.

Ví dụ:

- Home
- Alphabet
- Vocabulary
- Grammar
- Review
- AI Tutor
- Settings

---

## components/

Chứa reusable UI components.

Ví dụ:

- Sidebar
- Header
- LessonCard
- VocabularyCard
- GrammarCard
- Flashcard
- Quiz
- PengulCard
- AIChat

Component nên tập trung vào UI và interaction.

Không nên chứa toàn bộ learning data bên trong component.

---

## data/

Chứa learning data trong giai đoạn local development.

Ví dụ:

data/
└── korean/
    └── tong-hop/
        ├── course.json
        ├── lessons/
        ├── vocabulary/
        ├── grammar/
        └── quizzes/

Data có thể được tổ chức theo lesson.

---

## lib/

Chứa các helper và service functions.

Ví dụ:

- Database utilities
- API clients
- Validation
- Utility functions

---

## types/

Chứa TypeScript types/interfaces dùng chung.

Ví dụ:

- Course
- Book
- Lesson
- Vocabulary
- Grammar
- QuizQuestion
- UserProgress

---

# 13. Backend Structure

FastAPI backend dự kiến:

backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   └── core/
│
├── tests/
└── requirements.txt

---

# 14. FastAPI Responsibilities by Folder

## app/main.py

Entry point của FastAPI application.

---

## app/api/

Chứa API routes.

Ví dụ:

- AI Tutor endpoint
- Vocabulary explanation endpoint
- Grammar explanation endpoint
- Sentence correction endpoint

---

## app/services/

Chứa business logic của AI.

Ví dụ:

- AI service
- Prompt building
- LLM provider integration
- Context processing

---

## app/schemas/

Chứa request/response schemas.

Ví dụ:

AI Tutor request:

- lesson
- context type
- content
- question

AI Tutor response:

- answer
- optional metadata

---

## app/core/

Chứa configuration và các thành phần dùng chung.

Ví dụ:

- Environment configuration
- API configuration
- Security configuration

---

# 15. Database Architecture

PostgreSQL 18 là database chính của application, được quản lý thông qua Prisma ORM 7 từ Next.js.

Kiến trúc phân tách rõ ràng hai tầng dữ liệu:
1. Content Layer: JSON files trong `data/korean/` là source of truth cố định cho curriculum (khóa học, bài học, từ vựng, ngữ pháp).
2. User State Layer: PostgreSQL lưu trữ toàn bộ dữ liệu trạng thái của người dùng.

Các bảng trong database (Phase 8):

1. `users`: Tài khoản người dùng, xác thực, profile.
2. `user_lesson_progress`: Tiến độ học bài học (composite key: user_id, course_id, book_id, lesson_id).
3. `user_item_progress`: Trạng thái làm chủ từng mục từ vựng hoặc ngữ pháp (composite key: user_id, course_id, book_id, lesson_id, item_type, item_id).
4. `practice_attempts`: Lịch sử các lần làm quiz/typing practice.
5. `ai_conversations`: Quản lý các phiên hội thoại với AI Tutor theo ngữ cảnh học tập.
6. `ai_messages`: Các tin nhắn (user / assistant) trong từng phiên hội thoại.

Curriculum IDs (ví dụ: `L01-V001`, `lesson-01`) được tham chiếu dưới dạng application-level references và được validate với JSON content registry trước khi lưu.

---

# 16. Main Relationships

User Data Layer (PostgreSQL):

users
├── user_lesson_progress
├── user_item_progress
├── practice_attempts
└── ai_conversations
    └── ai_messages

Content Layer (JSON - Read-only):

Course (tong-hop)
└── Books (book-01)
    └── Lessons (lesson-01)
        ├── Vocabulary (vocabulary.json)
        └── Grammar (grammar.json)

---

# 17. Data Architecture Principle

Learning content không được hardcode trong UI component.

Ví dụ không nên:

Vocabulary component
→ chứa toàn bộ 32 từ vựng trong code.

Thay vào đó:

Learning data
→ Data layer
→ Component
→ UI

Điều này giúp:

- Dễ thêm lesson
- Dễ sửa nội dung
- Dễ migrate sang database
- Dễ maintain
- Không làm component quá lớn

---

# 18. Initial Data Strategy

Trong giai đoạn đầu, learning data có thể được lưu dưới dạng JSON/local data.

Nguồn ban đầu:

Hangul_Study_Lesson_01_updated.xlsx

Flow:

Excel
↓
Normalize / Convert
↓
JSON
↓
Next.js
↓
UI

Sau khi UI và data structure ổn định:

JSON curriculum data giữ nguyên là Content source of truth.
Xây dựng User State Layer với PostgreSQL + Prisma ORM.

---

# 19. Excel to Application Data

Excel không phải database runtime của website.

Excel được sử dụng như một nguồn chuẩn bị content.

Ví dụ:

Hangul_Study_Lesson_01_updated.xlsx

Sheets:

- Alphabet
- Vocabulary
- Grammar

Sau đó dữ liệu được chuyển thành application-friendly structure.

Ví dụ:

Vocabulary
→ lesson-01.json

Grammar
→ lesson-01.json

Alphabet
→ alphabet.json

Quá trình chuyển đổi phải giữ đúng dữ liệu nguồn.

Không tự ý thêm nội dung không có trong nguồn.

---

# 20. Database & Data Strategy

Trong kiến trúc Hangul Study, curriculum KHÔNG migrate vào database.

Chiến lược phân tầng:

1. Content Layer (Tĩnh / Giáo trình):
Excel
→ JSON (`data/korean/`)
→ Content Adapters (`frontend/lib/content/`)
→ Next.js UI / FastAPI AI Tools

2. User State Layer (Động / Dữ liệu người dùng):
Next.js (Server Actions / Route Handlers)
→ Prisma ORM
→ PostgreSQL

3. AI Layer (Xử lý thông minh):
Next.js
→ FastAPI (Stateless AI Service)
→ Gemini API

Cách tiếp cận này giúp giữ nội dung học tập cực kỳ nhẹ nhàng, có thể version control toàn bộ giáo trình qua Git, đồng thời tối ưu hóa database cho các tác vụ truy vấn user data tốc độ cao.

---

# 21. User Progress

User progress có thể lưu:

- Lesson progress
- Vocabulary known/not known
- Practice result
- Review status

MVP chỉ cần progress đơn giản.

Không triển khai Advanced SRS trong MVP.

---

# 22. AI Chat Data

Nếu lưu AI chat history, cấu trúc có thể gồm:

Chat Session
→ Chat Messages

Một session có thể liên quan tới:

- Course
- Book
- Lesson
- Vocabulary
- Grammar

Ví dụ:

Session:
Lesson 1 Grammar

Messages:
User question
AI answer
User follow-up
AI answer

---

# 23. API Communication

Next.js giao tiếp với FastAPI qua HTTP API.

Ví dụ:

POST /ai/tutor

Request:

- learning context
- user question

Response:

- AI answer

Endpoint naming có thể thay đổi khi API implementation bắt đầu.

Không cần cố định toàn bộ API trước khi bắt đầu development.

---

# 24. Environment Variables

Các secret không được hardcode vào source code.

Ví dụ:

- Database credentials
- LLM API key
- FastAPI URL
- Application secrets

Các giá trị này phải được lưu bằng environment variables.

Không commit secret lên GitHub.

---

# 25. Security Principles

MVP phải tuân thủ các nguyên tắc cơ bản:

- Không commit API keys
- Không commit database passwords
- Validate user input
- Không tin tưởng trực tiếp dữ liệu từ client
- Không expose secret ở frontend
- Không log sensitive information
- Sử dụng environment variables
- Xử lý lỗi API an toàn

---

# 26. Testing Strategy

Testing được thực hiện theo từng phase.

## Frontend

Kiểm tra:

- Page rendering
- Navigation
- Vocabulary interaction
- Grammar interaction
- Flashcard
- Quiz
- Review

## Backend

Kiểm tra:

- API response
- Validation
- AI service
- Error handling

## Integration

Kiểm tra:

Next.js
→ FastAPI
→ AI provider

và:

Next.js
→ Prisma ORM
→ PostgreSQL

Không cần xây dựng một hệ thống testing quá lớn cho MVP.

---

# 27. Error Handling

Application phải xử lý các trường hợp:

- API request thất bại
- AI provider không phản hồi
- Database unavailable
- Invalid input
- Missing learning content
- Network error

UI nên hiển thị thông báo dễ hiểu cho người dùng.

Không hiển thị raw stack trace cho người dùng cuối.

---

# 28. Deployment Architecture

Khi MVP hoàn thành, hệ thống có thể deploy thành:

Frontend / Web
→ Next.js hosting

AI Backend
→ FastAPI hosting

Database
→ Managed PostgreSQL (PostgreSQL 18)

Architecture:

Browser
↓
Next.js deployment
├── Prisma ORM
└── PostgreSQL

Next.js
↓
FastAPI deployment
↓
Gemini API

Deployment provider cụ thể sẽ được quyết định ở phase Deployment.

---

# 29. Local Development

Trong quá trình development:

Frontend:

Next.js development server

Backend:

FastAPI development server

Database:

PostgreSQL 18 local database.

Các service có thể chạy độc lập trong quá trình phát triển.

---

# 30. Development Principle

Ưu tiên phát triển theo thứ tự:

Project setup
↓
Layout
↓
Home
↓
Alphabet
↓
Lessons
↓
Vocabulary
↓
Grammar
↓
Practice / Review
↓
FastAPI
↓
AI Tutor
↓
PostgreSQL + Prisma
↓
Testing
↓
Deployment

Không xây AI hoặc database quá sớm nếu UI và learning data flow chưa ổn định.

---

# 31. Architecture Non-Goals

MVP không sử dụng:

- Microservices architecture
- Kubernetes
- Kafka
- Redis cluster
- Event-driven architecture
- Complex distributed systems
- Complex RAG pipeline
- Vector database
- Multiple independent backend services
- Separate database per service

Các công nghệ trên chỉ được xem xét nếu project thực sự cần trong tương lai.

---

# 32. Architecture Principles

### Principle 1 — Keep it simple

Kiến trúc phải đủ đơn giản để project owner hiểu được.

### Principle 2 — Separate responsibilities

UI, application logic, AI service và database phải có trách nhiệm rõ ràng.

### Principle 3 — Data is separate from UI

Learning content không được hardcode trong page/component.

### Principle 4 — AI is a supporting service

AI Tutor hỗ trợ learning experience.

AI không thay thế learning content.

### Principle 5 — Avoid premature complexity

Không thêm infrastructure hoặc technology chỉ vì nó phổ biến.

### Principle 6 — Build incrementally

Mỗi phase phải tạo ra một phần sản phẩm chạy được.

---

# 33. Architecture Decision Summary

Hangul Study sử dụng:

Frontend:
Next.js + TypeScript

Main application:
Next.js

AI service:
Python + FastAPI

Database:
PostgreSQL 18 (via Prisma ORM 7)

Curriculum source of truth:
JSON (`data/korean/`)

Content preparation:
Excel

AI flow:

Next.js
→ FastAPI
→ Gemini API

Normal user application data:

Next.js
→ Prisma ORM
→ PostgreSQL

Mục tiêu là tạo một kiến trúc dễ hiểu, dễ phát triển và đủ khả năng mở rộng cho Hangul Study sau MVP.