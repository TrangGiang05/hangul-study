# Hangul Study — Product Specification

## 1. Product Overview

**Product name:** Hangul Study

Hangul Study là một website học tiếng Hàn dành cho người Việt.

Website giúp người học học tiếng Hàn theo giáo trình thông qua:

- Bảng chữ cái
- Bài học
- Từ vựng
- Ngữ pháp
- Ôn tập / luyện tập
- AI Tutor

Mục tiêu của MVP là tạo ra một sản phẩm học tập có luồng sử dụng rõ ràng, có thể chạy thực tế và có nền tảng để phát triển tiếp.

---

## 2. Target Users

### Primary target

Người Việt Nam học tiếng Hàn, đặc biệt là người mới bắt đầu.

### Initial learning material

Giáo trình:

**Tiếng Hàn Tổng hợp Sơ cấp 1**

MVP tập trung vào nội dung mà project owner cung cấp.

---

## 3. Problem

Người học thường phải sử dụng nhiều nguồn khác nhau để:

- Học bảng chữ cái
- Học từ vựng
- Học ngữ pháp
- Làm bài luyện tập
- Tra cứu khi không hiểu

Hangul Study hướng tới việc gom các hoạt động học cơ bản vào một learning flow thống nhất.

---

## 4. Product Goal

Người dùng có thể:

1. Bắt đầu học Hangul nếu chưa biết bảng chữ cái.
2. Chọn giáo trình.
3. Chọn quyển.
4. Chọn bài học.
5. Học từ vựng.
6. Học ngữ pháp.
7. Làm bài luyện tập.
8. Ôn lại nội dung.
9. Hỏi AI Tutor khi gặp khó khăn.

### Learning flow chính

Trang chủ
→ Giáo trình
→ Quyển
→ Bài học
→ Từ vựng
→ Ngữ pháp
→ Ôn tập
→ AI Tutor

### Learning flow cho người mới

Trang chủ
→ Bảng chữ cái
→ Học Hangul
→ Bắt đầu bài học

---

# 5. MVP Scope

## 5.1 Home

Trang chủ là điểm bắt đầu của website.

Hiển thị:

- Lời chào
- Giáo trình
- Quyển học
- Bài học đang học
- Trạng thái học tập cơ bản
- Pengul

Trang chủ phải giúp người dùng nhanh chóng tiếp tục việc học.

---

## 5.2 Hangul Alphabet

Trang Bảng chữ cái là một phần chính thức của MVP.

Mục đích:

- Giúp người mới làm quen với Hangul.
- Là bước nền tảng trước khi học bài.

### Categories

- Nguyên âm cơ bản
- Nguyên âm ghép
- Phụ âm cơ bản
- Phụ âm kép

### Character information

Mỗi chữ có thể hiển thị:

- Chữ cái
- Phiên âm
- Loại
- Ví dụ
- Nghĩa ví dụ
- Ghi chú

MVP không bao gồm:

- Nhận diện chữ viết tay
- Chấm phát âm
- Luyện phát âm bằng AI
- Hệ thống luyện viết nâng cao

---

# 6. Course / Textbook

Cấu trúc học:

Course
→ Book
→ Lesson

MVP tập trung vào:

**Tiếng Hàn Tổng hợp Sơ cấp 1**

Chỉ cần triển khai dữ liệu cần thiết cho MVP.

Không yêu cầu nhập toàn bộ các quyển hoặc toàn bộ giáo trình nếu chưa có dữ liệu.

---

# 7. Lessons

Mỗi lesson có:

- ID
- Tên bài
- Tên tiếng Việt nếu có
- Vocabulary
- Grammar
- Practice

Ví dụ:

Bài 1 · 자기소개
Giới thiệu

Khi mở lesson:

Bài 1
├── Từ vựng
├── Ngữ pháp
└── Ôn tập

---

# 8. Vocabulary

Trang từ vựng giúp người dùng học các từ trong từng bài.

### Vocabulary information

Mỗi từ có thể gồm:

- ID
- Từ tiếng Hàn
- Nghĩa
- Loại từ
- Ví dụ tiếng Hàn
- Dịch ví dụ
- Ghi chú

### Learning interaction

MVP hỗ trợ:

- Flashcard
- Previous / Next
- Đánh dấu đã biết / chưa biết
- Xem ví dụ
- Basic search/filter khi cần

### Contextual AI

Từ vựng có thể có:

**Hỏi AI**

Khi người dùng hỏi AI từ một vocabulary item, AI nhận được context của từ đang học.

Ví dụ:

Lesson: Bài 1
Vocabulary: 한국
Meaning: Hàn Quốc

---

# 9. Grammar

Trang ngữ pháp hiển thị các cấu trúc theo lesson.

### Grammar information

Mỗi grammar item có thể gồm:

- ID
- Ngữ pháp
- Cấu trúc
- Ý nghĩa
- Cách dùng / Giải thích
- Ví dụ tiếng Hàn
- Dịch ví dụ
- Ghi chú

### Grammar detail

Ví dụ:

입니다

N은/는 N입니다

Ý nghĩa:
Là...

Cách dùng:
...

Ví dụ:
저는 학생입니다.

Tôi là học sinh.

Có thể có:

**Hỏi AI**

AI nhận context của grammar đang học.

---

# 10. Practice / Review

Practice giúp người dùng kiểm tra lại nội dung đã học.

### MVP modes

- Flashcard
- Multiple choice
- Typing vocabulary
- Fill in the blank

### Basic flow

Ôn tập
→ Chọn nội dung
→ Làm bài
→ Kết quả
→ Xem lại câu sai

MVP không yêu cầu hệ thống SRS nâng cao.

---

# 11. AI Tutor

AI Tutor là gia sư AI hỗ trợ quá trình học.

AI Tutor không phải một chatbot tổng quát độc lập với nội dung học.

### Functions

AI Tutor có thể:

- Giải thích từ vựng
- Giải thích ngữ pháp
- Giải thích câu tiếng Hàn
- Sửa câu tiếng Hàn
- Đưa ra ví dụ
- Trả lời câu hỏi về bài học
- Hỗ trợ luyện hội thoại cơ bản

### Language

AI ưu tiên:

- Giải thích bằng tiếng Việt
- Ví dụ bằng tiếng Hàn
- Dịch sang tiếng Việt

### Context

Khi được gọi từ một nội dung cụ thể, AI nên nhận context:

Course
Book
Lesson
Vocabulary / Grammar
User question

Ví dụ:

User:
Tại sao dùng 입니다 ở đây?

Context:
Lesson 1
Grammar: 입니다
Pattern: N은/는 N입니다

---

# 12. Settings

MVP Settings chỉ cần các thiết lập cơ bản.

Có thể gồm:

- Ngôn ngữ giao diện
- Theme
- Thông tin tài khoản
- Đăng xuất

Không cần xây dựng hệ thống Settings phức tạp.

---

# 13. Main Navigation

Navigation chính:

Trang chủ
Bảng chữ cái
Từ vựng
Ngữ pháp
Ôn tập
AI Tutor
Cài đặt

---

# 14. Core User Flow

## New learner

Trang chủ
↓
Bảng chữ cái
↓
Nguyên âm
↓
Phụ âm
↓
Ghép âm
↓
Bắt đầu học bài

## Existing learner

Trang chủ
↓
Tiếng Hàn Tổng hợp Sơ cấp 1
↓
Quyển 1
↓
Bài 1
↓
Từ vựng
↓
Ngữ pháp
↓
Ôn tập
↓
AI Tutor khi cần

---

# 15. Example Learning Session

Một phiên học điển hình:

1. Mở Hangul Study
2. Chọn Tiếng Hàn Tổng hợp Sơ cấp 1
3. Chọn Quyển 1
4. Chọn Bài 1 · 자기소개
5. Học từ vựng
6. Xem ví dụ
7. Học ngữ pháp
8. Làm bài luyện tập
9. Xem kết quả
10. Ôn lại nội dung chưa nhớ
11. Hỏi AI Tutor nếu có điểm chưa hiểu

---

# 16. Content Data

Learning content phải được tách khỏi UI.

Không hardcode toàn bộ nội dung vào component.

Nguồn dữ liệu Lesson 01 hiện tại:

Hangul_Study_Lesson_01_updated.xlsx

Các sheet hiện có:

- Alphabet
- Vocabulary
- Grammar

### Alphabet

Bao gồm dữ liệu cho:

- Nguyên âm cơ bản
- Nguyên âm ghép
- Phụ âm cơ bản
- Phụ âm kép

### Vocabulary

Dữ liệu từ vựng của Lesson 01.

### Grammar

Dữ liệu ngữ pháp của Lesson 01.

---

# 17. UI Direction

Hangul Study nên có UI:

- Sạch
- Dễ đọc
- Thân thiện
- Phù hợp người mới học
- Có cảm giác như một sản phẩm giáo dục hiện đại

Pengul là mascot của sản phẩm.

Không sao chép trực tiếp UI hoặc branding của các sản phẩm khác.

---

# 18. Responsive

MVP cần hỗ trợ responsive cơ bản.

Ưu tiên:

1. Desktop
2. Tablet
3. Mobile basic layout

Không cần tối ưu mobile như một native mobile application.

---

# 19. MVP Exclusions

Các tính năng sau không thuộc MVP:

- Listening learning
- Reading comprehension
- Handwriting recognition
- Pronunciation scoring
- Full TOPIK mock test
- Advanced SRS
- Leaderboard
- Friends
- Community
- Payment / VIP
- Mobile app
- Admin CMS
- Marketplace
- AI voice
- AI avatar
- Complex RAG
- Microservices
- Multiple textbook systems
- Google login
- Advanced audio learning

Nếu muốn thêm bất kỳ feature nào trong danh sách trên, phải được project owner phê duyệt trước.

---

# 20. Definition of Done

MVP được coi là hoàn thành khi:

- Website chạy được
- Navigation hoạt động
- Bảng chữ cái hoạt động
- Course / Book / Lesson hoạt động
- Vocabulary hoạt động
- Grammar hoạt động
- Practice hoạt động
- Review hoạt động
- AI Tutor hoạt động
- Learning data tách khỏi UI
- FastAPI AI backend hoạt động
- MySQL persistence được triển khai
- Các chức năng quan trọng đã được test
- GitHub repository được tổ chức hợp lý
- Website được deploy lên URL thực tế

---

# 21. Product Principle

Hangul Study ưu tiên:

**Working product > Feature quantity**

**Learning experience > Technical complexity**

**Maintainability > Quick hacks**

**Understanding > Copying code**

MVP phải hoàn thành được learning flow cốt lõi trước khi mở rộng tính năng.