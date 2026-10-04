import io
import os
import sys

# Ensure UTF-8 output
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.services.gemini import ask_gemini


def run_live_tests():
    context = {"courseId": "tong-hop", "bookId": "book-01", "lessonId": "lesson-01"}

    print("=== LIVE TEST 1: Greeting (should not trigger tool call) ===")
    answer_greeting = ask_gemini(
        "Xin chào bạn, chúc bạn một ngày tốt lành!",
        context,
    )
    print("Greeting Answer:\n", answer_greeting)
    print("-" * 50)

    print("=== LIVE TEST 2: Vocabulary question (should trigger lookup_vocabulary) ===")
    answer_vocab = ask_gemini(
        "Từ '한국' trong bài 1 có nghĩa là gì và có câu ví dụ nào trong giáo trình?",
        context,
    )
    print("Vocab Answer:\n", answer_vocab)
    print("-" * 50)

    print("=== LIVE TEST 3: Grammar question '입니다 nghĩa là gì?' (should trigger lookup_grammar) ===")
    answer_g1 = ask_gemini(
        "입니다 nghĩa là gì?",
        context,
    )
    print("Grammar '입니다' Answer:\n", answer_g1)
    print("-" * 50)

    print("=== LIVE TEST 4: Grammar question 'Giải thích 은/는 trong bài 1' (should trigger lookup_grammar) ===")
    answer_g2 = ask_gemini(
        "Giải thích 은/는 trong bài 1",
        context,
    )
    print("Grammar '은/는' Answer:\n", answer_g2)
    print("-" * 50)

    print("=== LIVE TEST 5: Grammar question '입니까? dùng khi nào?' (should trigger lookup_grammar) ===")
    answer_g3 = ask_gemini(
        "입니까? dùng khi nào?",
        context,
    )
    print("Grammar '입니까?' Answer:\n", answer_g3)
    print("-" * 50)


if __name__ == "__main__":
    run_live_tests()
