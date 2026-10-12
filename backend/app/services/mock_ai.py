import time
import uuid
from typing import Optional
from app.services.gemini import lookup_vocabulary, lookup_grammar


def mock_ask_gemini(
    message: str,
    context: dict,
    previous_interaction_id: Optional[str] = None,
) -> tuple[str, str]:
    """
    Fast, deterministic mock response provider for AI Tutor during E2E testing.
    Isolates external Gemini API calls while preserving real curriculum lookup tools,
    context handling, multi-turn chaining, and database persistence.
    """
    clean_msg = message.strip()
    msg_lower = clean_msg.lower()
    int_id = f"mock_int_{uuid.uuid4().hex[:12]}"

    course_id = context.get("courseId") or "tong-hop"
    book_id = context.get("bookId") or "book-01"
    lesson_id = context.get("lessonId") or "lesson-01"

    # 1. Greetings (Test G.1)
    if "xin chào" in msg_lower or "chào" in msg_lower or "hello" in msg_lower:
        answer = (
            "Xin chào! Mình là Pengul, trợ lý AI học tiếng Hàn của bạn. "
            "Rất vui được đồng hành cùng bạn học Tiếng Hàn Tổng hợp Sơ cấp 1! "
            "Bạn có thắc mắc gì về từ vựng hay ngữ pháp trong bài học không?"
        )
        return answer, int_id

    # 2. Secret code prompt (Security Test 4)
    if "alpha_9921" in msg_lower or "private secret code" in msg_lower:
        answer = (
            f"Đã ghi nhận thông tin bí mật của bạn: {clean_msg}. "
            "Thông tin này được lưu trữ riêng tư và cách ly an toàn trong tài khoản của bạn."
        )
        return answer, int_id

    # 3. Vocabulary inquiry (Test G.2)
    if "한국" in clean_msg or "nghĩa là gì" in msg_lower and "từ" in msg_lower:
        vocab_result = lookup_vocabulary("한국", lesson_id=lesson_id, course_id=course_id, book_id=book_id)
        if vocab_result.get("found") and vocab_result.get("items"):
            item = vocab_result["items"][0]
            korean = item.get("korean", "한국")
            meaning = item.get("meaning", "Hàn Quốc")
            ex = item.get("examples", [])
            ex_trans = (ex[0].get("translation") or ex[0].get("vietnamese", "")) if ex else ""
            ex_str = f"\nVí dụ: {ex[0].get('korean', '')} ({ex_trans})" if ex else ""
            answer = f"Từ **{korean}** trong Bài 1 có nghĩa là **{meaning}**.{ex_str}\nChúc bạn học tốt nhé!"
            return answer, int_id

    # 4. Grammar inquiry
    if "입니다" in clean_msg or "입니까" in clean_msg:
        grammar_result = lookup_grammar("입니다", lesson_id=lesson_id, course_id=course_id, book_id=book_id)
        if grammar_result.get("found") and grammar_result.get("items"):
            item = grammar_result["items"][0]
            title = item.get("title", "입니다")
            meaning = item.get("meaning", "Là...")
            answer = f"Ngữ pháp **{title}** dùng làm đuôi câu khẳng định trang trọng, mang nghĩa: **{meaning}**.\nVí dụ: 저는 학생입니다 (Tôi là học sinh)."
            return answer, int_id

    # 5. Multi-turn continuing questions
    if previous_interaction_id:
        answer = (
            f"Tiếp tục cuộc trò chuyện của chúng ta về '{clean_msg}': "
            "Trong tiếng Hàn, bạn có thể áp dụng thêm đuôi câu và từ vựng tương tự để tạo thành câu hoàn chỉnh nhé!"
        )
        return answer, int_id

    # 6. Default educational response
    answer = (
        f"Pengul đã nhận được câu hỏi của bạn: '{clean_msg}'. "
        "Trong bài học Tiếng Hàn Tổng hợp, hãy luyện phát âm và viết thường xuyên để ghi nhớ lâu hơn nhé! 화이팅!"
    )
    return answer, int_id
