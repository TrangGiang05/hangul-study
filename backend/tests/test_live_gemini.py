import io
import os
import sys

# Ensure UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from app.services.gemini import ask_gemini

print("=== LIVE TEST 1: Greeting (should not trigger tool call) ===")
answer_greeting = ask_gemini(
    "Xin chào bạn, chúc bạn một ngày tốt lành!",
    {"courseId": "tong-hop", "bookId": "book-01", "lessonId": "lesson-01"}
)
print("Greeting Answer:")
print(answer_greeting)
print("-" * 50)

print("=== LIVE TEST 2: Vocabulary question (should trigger lookup_vocabulary) ===")
answer_vocab = ask_gemini(
    "Từ '한국' trong bài 1 có nghĩa là gì và có câu ví dụ nào trong giáo trình?",
    {"courseId": "tong-hop", "bookId": "book-01", "lessonId": "lesson-01"}
)
print("Vocab Answer:")
print(answer_vocab)
print("-" * 50)
