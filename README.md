# Hangul Study

Hangul Study là website học tiếng Hàn dành cho người Việt.

## 🎯 Mục tiêu

Hangul Study giúp người học học tiếng Hàn thông qua:

- Bảng chữ cái Hangul
- Giáo trình
- Bài học
- Từ vựng
- Ngữ pháp
- Ôn tập
- AI Tutor

Project được xây dựng như một sản phẩm portfolio thực tế, với mục tiêu có thể phát triển và deploy thành một website hoàn chỉnh.

---

## 📚 Learning Flow

### Người mới bắt đầu

Trang chủ
→ Bảng chữ cái
→ Học Hangul
→ Bắt đầu bài học

### Người đã học Hangul

Trang chủ
→ Giáo trình
→ Quyển
→ Bài học
→ Từ vựng
→ Ngữ pháp
→ Ôn tập
→ AI Tutor

---

## 🛠️ Tech Stack

### Frontend / Web

- Next.js
- TypeScript
- React

### AI Backend

- Python
- FastAPI

### Database

- PostgreSQL 18
- Prisma ORM 7

### AI

- Gemini API

---

## 🏗️ Architecture

High-level architecture:

Browser
↓
Next.js
├── UI
├── Application logic
└── Prisma ORM
    ↓
    PostgreSQL (User State)
│
└── FastAPI (AI Service)
    ↓
    Gemini API (LLM)

Chi tiết kiến trúc được mô tả trong:

- docs/product-spec.md
- docs/architecture.md
- docs/data-model.md

---

## 📖 Initial Learning Material

Giáo trình ban đầu:

**Tiếng Hàn Tổng hợp Sơ cấp 1**

Learning content được chuẩn bị riêng cho project.

Các loại dữ liệu chính:

- Alphabet
- Vocabulary
- Grammar
- Practice

---

## 🐧 Mascot

Tên mascot:

**Pengul**

Pengul được xây dựng dựa trên ý tưởng:

**Penguin + Hangul**

Tính cách:

- Patient
- Curious
- Encouraging
- Playful

Pengul là nhân vật riêng của Hangul Study.

---

## 📁 Project Structure

```text
hangul-study/
├── .skills/
│   └── hangul-study/
│       └── SKILL.md
│
├── data/
│   └── korean/           # Curriculum JSON source of truth
│
├── docs/
│   ├── product-spec.md
│   ├── architecture.md
│   └── data-model.md
│
├── frontend/             # Next.js Application & UI
│   └── prisma/           # Prisma ORM schema & migrations (Phase 8)
│
├── backend/              # FastAPI AI service (Gemini)
│
├── README.md
└── .gitignore