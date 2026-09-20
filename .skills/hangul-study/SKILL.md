# Hangul Study Skill

## 1. Project Identity

Project name: Hangul Study

Hangul Study is a Korean-learning website for Vietnamese learners.

The product helps users learn Korean through:
- Hangul alphabet
- Textbook-based lessons
- Vocabulary
- Grammar
- Practice
- Review
- AI Tutor

The project is designed as a real portfolio project and should be maintainable, extensible, and suitable for future deployment.

Reference product:
- nhaitopik.com may be used as a product-structure and UX reference.
- Do NOT copy its code, exact UI, branding, content, or copyrighted materials.

Mascot:
- Name: Pengul
- Concept: Penguin + Hangul
- Personality: patient, curious, encouraging, playful
- Pengul must remain an original character and must not imitate Duolingo's owl or other protected characters.

---

## 2. Target Users

Primary users:
- Vietnamese learners of Korean
- Especially beginner learners
- Initial textbook focus: Tiếng Hàn Tổng hợp Sơ cấp 1

Language policy:
- UI: Vietnamese
- Vocabulary meanings: Vietnamese
- Grammar explanations: Vietnamese
- Korean examples should include Vietnamese translations
- AI Tutor should prioritize Vietnamese explanations

Do not expand the initial target audience to international learners unless explicitly requested.

---

## 3. Product Goal

The main learning flow is:

Trang chủ
→ Chọn giáo trình
→ Chọn quyển
→ Chọn bài học
→ Từ vựng
→ Ngữ pháp
→ Ôn tập
→ AI Tutor when needed

For users who do not know Hangul:

Trang chủ
→ Bảng chữ cái
→ Học Hangul cơ bản
→ Bắt đầu bài học

The product should feel like a coherent Korean-learning website, not a generic chatbot with flashcards.

---

## 4. MVP Scope

### Included

1. Home
2. Hangul Alphabet
3. Courses / Textbooks
4. Books
5. Lessons
6. Vocabulary
7. Grammar
8. Practice / Review
9. AI Tutor
10. Settings

### Hangul Alphabet

The MVP includes:
- Basic vowels
- Compound vowels
- Basic consonants
- Double consonants
- Character details
- Romanization
- Examples
- Notes

Do not implement advanced handwriting recognition or pronunciation scoring in MVP.

### Vocabulary

Vocabulary should support:
- Lesson association
- Korean word
- Vietnamese meaning
- Part of speech
- Example sentence
- Vietnamese translation
- Notes
- Known / not known state
- Flashcard interaction
- Previous / next navigation
- Basic search/filter where appropriate

### Grammar

Grammar should support:
- Lesson association
- Grammar title
- Pattern
- Meaning
- Vietnamese explanation
- Korean examples
- Vietnamese translations
- Notes
- Contextual "Ask AI"

### Practice

MVP practice modes:
- Flashcard
- Multiple choice
- Typing vocabulary
- Fill in the blank where appropriate

Practice should provide basic results and allow users to review incorrect answers.

### AI Tutor

AI Tutor is a contextual learning assistant.

It should support:
- Vocabulary explanation
- Grammar explanation
- Sentence explanation
- Korean sentence correction
- Example generation
- Korean learning questions
- Basic conversation practice

When AI is opened from vocabulary or grammar, the relevant learning context should be provided to the AI.

AI should support textbook learning rather than replace the textbook.

---

## 5. Explicitly Out of Scope for MVP

Do NOT add these features unless the project owner explicitly approves them:

- Listening learning system
- Reading comprehension system
- Hangul handwriting recognition
- Full TOPIK mock tests
- Advanced spaced repetition system
- Leaderboards
- Friends/community
- Payments/VIP
- Mobile application
- Admin CMS
- Marketplace
- AI voice
- AI avatar
- Complex RAG system
- Microservices architecture
- Multiple textbook systems
- Google login
- Pronunciation scoring
- Advanced audio-learning system

Do not expand the MVP simply because a feature seems interesting.

---

## 6. Product Navigation

Recommended primary navigation:

- Trang chủ
- Bảng chữ cái
- Từ vựng
- Ngữ pháp
- Ôn tập
- AI Tutor
- Cài đặt

The Home page provides access to textbooks and learning progress.

The learning hierarchy is:

Course
→ Book
→ Lesson
→ Vocabulary / Grammar / Practice

---

## 7. Technology Stack

Frontend:
- Next.js
- TypeScript
- React
- App Router
- CSS / appropriate styling solution

Backend:
- Python
- FastAPI

Database:
- MySQL

AI:
- LLM provider accessed through FastAPI
- Keep the AI provider abstracted where practical

Repository:
- Git
- GitHub

Deployment:
- Deploy a real public URL after the local MVP is stable.

Do not introduce unnecessary infrastructure such as:
- Kubernetes
- Kafka
- Redis
- Microservices
- Complex cloud architecture

unless explicitly required later.

---

## 8. Architecture

Preferred architecture:

Browser
↓
Next.js
├── UI / pages / components
├── Server actions / route handlers
└── Database access
│
└── AI requests
    ↓
FastAPI
    ↓
LLM API

Next.js owns the main product/backend functionality.

FastAPI owns AI-related functionality.

The AI service should receive the necessary learning context from the application.

Avoid having multiple services independently modify the same database unless there is a clear future requirement.

---

## 9. Data Architecture

Do NOT hardcode learning content directly inside React components such as App.tsx or page components.

Learning data must be separated from UI logic.

Initial development may use structured JSON or other local data sources to stabilize the UI and data flow.

Later, persistent data can move to MySQL.

Recommended conceptual structure:

data/
└── korean/
    ├── alphabet/
    │   ├── vowels.json
    │   ├── consonants.json
    │   └── combinations.json
    │
    └── tong-hop-so-cap-1/
        ├── course.json
        ├── lessons/
        ├── vocabulary/
        ├── grammar/
        └── quizzes/

Do not manually write JSON if structured source data such as Excel is already available.

The current lesson source may be maintained in Excel and later transformed into application data.

---

## 10. Database Direction

Future MySQL entities may include:

- users
- courses
- books
- lessons
- vocabulary
- grammar
- examples
- quiz_questions
- user_progress
- user_vocabulary
- chat_sessions
- chat_messages

Relationships:

Course 1 → N Books
Book 1 → N Lessons
Lesson 1 → N Vocabulary
Lesson 1 → N Grammar
Vocabulary / Grammar 1 → N Examples
User 1 → N Progress
User N → N Vocabulary through user_vocabulary

Keep the database design simple and avoid unnecessary normalization or abstraction.

---

## 11. Content Rules

Do not invent textbook content when source material is available.

When working from user-provided textbook or Excel content:
- Preserve the source terminology.
- Preserve the intended lesson organization.
- Do not silently replace source content with generic examples.
- Do not add unsupported textbook information.
- If information is missing, ask the project owner or leave it clearly marked as missing.

The project owner is responsible for providing or authorizing learning content.

---

## 12. Frontend Rules

Use reusable components.

Prefer:
- Clear component boundaries
- Small focused components
- Reusable UI components
- Data-driven rendering
- Accessible semantic HTML
- Responsive layouts

Avoid:
- One huge component
- Hardcoded repeated data
- Duplicate UI logic
- Inline business logic everywhere
- Unnecessary dependencies

Do not put all application logic into App.tsx.

---

## 13. AI Tutor Rules

AI Tutor must be educational and contextual.

When possible, provide context such as:
- Current course
- Current book
- Current lesson
- Current vocabulary
- Current grammar
- User question

AI responses should:
- Prefer Vietnamese explanations
- Use Korean examples when useful
- Include Vietnamese translations
- Avoid unnecessary complexity for beginner learners
- Explain rather than simply give answers
- Correct Korean mistakes clearly and constructively

Do not make AI Tutor a completely unrestricted generic chatbot inside the product.

---

## 14. Coding Standards

Use:
- TypeScript for frontend code
- Python type hints where appropriate
- Clear naming
- Small functions
- Meaningful component names
- Consistent formatting
- Environment variables for secrets

Never hardcode:
- API keys
- Passwords
- Tokens
- Database credentials
- Private secrets

Use `.env` files locally and ensure secrets are excluded from Git.

---

## 15. Security

Never commit secrets.

Sensitive configuration must use environment variables.

Validate user input at backend boundaries.

Do not trust client-side validation alone.

AI API keys must remain server-side.

Do not expose private API credentials in frontend code.

---

## 16. Testing

Important functionality should be tested before being considered complete.

At minimum, verify:
- Application starts successfully
- Pages load
- Navigation works
- Data renders correctly
- Vocabulary interactions work
- Grammar interactions work
- Practice scoring works
- AI requests work when implemented
- Backend endpoints return expected responses
- Build succeeds

Do not claim a feature is complete without testing it.

---

## 17. Git and GitHub Workflow

Use small meaningful commits.

Recommended workflow:

1. Understand the task
2. Make the smallest necessary change
3. Run the application
4. Test the changed feature
5. Review the code
6. Commit
7. Push

Commit messages should describe the change.

Examples:

- feat: add alphabet page
- feat: add vocabulary flashcards
- feat: add grammar lesson view
- fix: correct vocabulary navigation
- refactor: extract lesson data

Do not make large unrelated commits.

---

## 18. Vibe Coding Workflow

ChatGPT acts as:
- Mentor
- Architect
- Reviewer
- Planner

GitHub Copilot acts as:
- Coding assistant
- Implementation assistant

Preferred workflow:

User goal
→ ChatGPT analyzes
→ ChatGPT writes a precise Copilot prompt
→ Copilot implements
→ User runs/tests
→ User reports result
→ ChatGPT reviews
→ Fix prompt if necessary
→ Test again
→ Commit

Copilot must not independently expand the project scope.

When a task is complex:
- Explain the purpose first
- Break the task into small steps
- Give one implementation task at a time

---

## 19. Development Process

Build in phases:

### Phase 1
Project setup

### Phase 2
Layout + Sidebar + Home

### Phase 3
Hangul Alphabet

### Phase 4
Lessons + Vocabulary

### Phase 5
Grammar

### Phase 6
Practice / Review

### Phase 7
FastAPI + AI Tutor

### Phase 8
MySQL + persistent progress

### Phase 9
Testing + refinement

### Phase 10
Deployment

Do not skip directly to advanced features.

---

## 20. Scope Control

The MVP must remain small enough to finish.

If a proposed feature is not required for the defined MVP:
- Do not implement it automatically.
- Explain why it is outside scope.
- Ask the project owner before adding it.

Prioritize:
1. Working product
2. Correct learning flow
3. Maintainable architecture
4. Good user experience
5. AI Tutor integration
6. Deployment

Do not prioritize feature quantity over product completion.

---

## 21. Working Style

The project owner is a beginner/early learner in software engineering.

Therefore:
- Explain important technical concepts simply.
- Prefer Vietnamese explanations.
- Keep useful English IT terminology.
- Avoid unnecessary jargon.
- Teach the reasoning behind important architectural decisions.
- Do not dump large amounts of unexplained code.
- Guide one step at a time when requested.

The goal is not only to finish Hangul Study.

The goal is for the project owner to understand how a real software project is designed, built, tested, versioned, and deployed.

---

## 22. Definition of Done

The MVP is considered complete when:

- Website runs successfully
- Core navigation works
- Hangul Alphabet works
- Textbook/book/lesson structure works
- Vocabulary works
- Grammar works
- Practice works
- Review works
- AI Tutor works
- Data is separated from UI components
- FastAPI AI backend works
- MySQL persistence is implemented where required
- Important functionality is tested
- GitHub repository is organized
- Application is deployed to a real URL

Do not declare the project complete before these core requirements are verified.