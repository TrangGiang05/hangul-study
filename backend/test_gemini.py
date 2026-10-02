from app.services.gemini import ask_gemini

context = {
    "type": "vocabulary",
    "vocab": "한국",
    "meaning": "Hàn Quốc"
}

answer = ask_gemini(
    "Từ này dùng như thế nào?",
    context
)

print(answer)