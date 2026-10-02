import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)


def ask_gemini(message: str, context: dict) -> str:
    prompt = f"""
Bạn là AI Tutor của website học tiếng Hàn Hangul Study.

Ngữ cảnh học tập:
- Loại nội dung: {context.get("type")}
- Từ tiếng Hàn: {context.get("vocab")}
- Nghĩa tiếng Việt: {context.get("meaning")}

Câu hỏi của người học:
{message}

Hãy trả lời bằng tiếng Việt, giải thích ngắn gọn, dễ hiểu cho người mới học tiếng Hàn.
Nếu phù hợp, hãy đưa thêm một ví dụ tiếng Hàn.
"""

    interaction = client.interactions.create(
        model="gemini-3.1-flash-lite",
        input=prompt,
        generation_config={"thinking_level": "low"},
    )

    return interaction.output_text