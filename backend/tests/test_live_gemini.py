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

from fastapi.testclient import TestClient
from app.main import app
from app.services.gemini import ask_gemini


def run_live_tests():
    context = {"courseId": "tong-hop", "bookId": "book-01", "lessonId": "lesson-01"}
    client = TestClient(app)

    print("=== LIVE TEST 1: Greeting (should not trigger tool call) ===")
    answer_greeting, int_id1 = ask_gemini(
        "Xin chào bạn, chúc bạn một ngày tốt lành!",
        context,
    )
    print("Greeting Answer:\n", answer_greeting)
    print("Interaction ID:", int_id1)
    print("-" * 50)

    print("=== LIVE TEST 2: Vocabulary question (should trigger lookup_vocabulary) ===")
    answer_vocab, int_id2 = ask_gemini(
        "Từ '한국' trong bài 1 có nghĩa là gì và có câu ví dụ nào trong giáo trình?",
        context,
    )
    print("Vocab Answer:\n", answer_vocab)
    print("Interaction ID:", int_id2)
    print("-" * 50)

    print("=== LIVE TEST 3: Multi-turn Conversation via /ai/chat ===")
    print("--> Turn 1: '입니다 nghĩa là gì?'")
    res1 = client.post("/ai/chat", json={
        "message": "입니다 nghĩa là gì?",
        "context": context,
        "conversationId": None,
    })
    data1 = res1.json()
    conv_id = data1["conversationId"]
    print("Turn 1 Answer:\n", data1["answer"])
    print("Assigned conversationId:", conv_id)
    print("-" * 30)

    print("--> Turn 2: 'Cho mình thêm 2 ví dụ.' (Continuing conversation)")
    res2 = client.post("/ai/chat", json={
        "message": "Cho mình thêm 2 ví dụ.",
        "context": context,
        "conversationId": conv_id,
    })
    data2 = res2.json()
    print("Turn 2 Answer:\n", data2["answer"])
    print("Maintained conversationId:", data2["conversationId"])
    print("-" * 30)

    print("--> Turn 3: 'Thế còn 입니까?' (Continuing conversation)")
    res3 = client.post("/ai/chat", json={
        "message": "Thế còn 입니까?",
        "context": context,
        "conversationId": conv_id,
    })
    data3 = res3.json()
    print("Turn 3 Answer:\n", data3["answer"])
    print("Maintained conversationId:", data3["conversationId"])
    print("-" * 50)

    print("=== LIVE TEST 4: Auto-healing unknown conversationId ===")
    res_heal = client.post("/ai/chat", json={
        "message": "Chào bạn, mình hỏi câu mới",
        "context": context,
        "conversationId": "unknown-nonexistent-uuid-12345",
    })
    data_heal = res_heal.json()
    print("Auto-heal Answer:\n", data_heal["answer"])
    print("Healed conversationId:", data_heal["conversationId"])
    print("-" * 50)


if __name__ == "__main__":
    run_live_tests()
