import json
import os
import re
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

# Root of the shared data directory.
# From backend/app/services/ we go: services -> app -> backend -> hangul-study -> data/korean
_DATA_ROOT = Path(__file__).parent.parent.parent.parent / "data" / "korean"

_SAFE_IDENTIFIER_REGEX = re.compile(r"^[a-zA-Z0-9_-]+$")


def _is_safe_identifier(val: Any) -> bool:
    """Validate that path components contain only safe alphanumeric characters."""
    if not val or not isinstance(val, str):
        return False
    return bool(_SAFE_IDENTIFIER_REGEX.match(val))


def _get_lesson_vocabulary(
    course_id: str,
    book_id: str,
    lesson_id: str,
) -> list[dict]:
    """
    Locate and load the vocabulary list for a specific lesson from the local JSON data.
    Returns a list of vocabulary item dicts, or an empty list if not found or invalid.
    """
    if not (_is_safe_identifier(course_id) and _is_safe_identifier(book_id) and _is_safe_identifier(lesson_id)):
        return []

    file_path = _DATA_ROOT / "courses" / course_id / "books" / book_id / "lessons" / lesson_id / "vocabulary.json"
    if not file_path.is_file():
        return []

    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return []

    return []


def _get_lesson_grammar(
    course_id: str,
    book_id: str,
    lesson_id: str,
) -> list[dict]:
    """
    Locate and load the grammar list for a specific lesson from the local JSON data.
    Returns a list of grammar item dicts, or an empty list if not found or invalid.
    """
    if not (_is_safe_identifier(course_id) and _is_safe_identifier(book_id) and _is_safe_identifier(lesson_id)):
        return []

    file_path = _DATA_ROOT / "courses" / course_id / "books" / book_id / "lessons" / lesson_id / "grammar.json"
    if not file_path.is_file():
        return []

    try:
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return []

    return []


def _load_content(context: dict) -> dict | None:
    """
    Load a single vocabulary or grammar item from the local JSON data files
    based on the structured learning context.

    Returns the matching item dict, or None if the context is incomplete
    or the item cannot be found.
    """
    course_id = context.get("courseId")
    book_id = context.get("bookId")
    lesson_id = context.get("lessonId")
    module = context.get("module")
    content_id = context.get("contentId")

    # All five fields must be present and non-empty to attempt a lookup.
    if not all([course_id, book_id, lesson_id, module, content_id]):
        return None

    if module == "vocabulary":
        items = _get_lesson_vocabulary(course_id, book_id, lesson_id)
        return next((item for item in items if item.get("id") == content_id), None)
    elif module == "grammar":
        items = _get_lesson_grammar(course_id, book_id, lesson_id)
        return next((item for item in items if item.get("id") == content_id), None)
    else:
        return None


def lookup_vocabulary(
    query: str,
    lesson_id: str | None = None,
    course_id: str | None = None,
    book_id: str | None = None,
    **kwargs: Any,
) -> dict:
    """
    Search vocabulary in the Hangul Study curriculum by Korean word,
    Vietnamese meaning, or vocabulary item ID.

    Returns a structured JSON-serializable dictionary with matching items (max 3).
    """
    if not query or not isinstance(query, str):
        return {
            "found": False,
            "count": 0,
            "items": [],
            "message": "Không tìm thấy từ vựng trong giáo trình Hangul Study.",
        }

    clean_query = query.strip()
    if not clean_query or len(clean_query) > 100:
        return {
            "found": False,
            "count": 0,
            "items": [],
            "message": "Không tìm thấy từ vựng trong giáo trình Hangul Study.",
        }

    query_lower = clean_query.lower()
    target_course = course_id if _is_safe_identifier(course_id) else "tong-hop"
    target_book = book_id if _is_safe_identifier(book_id) else "book-01"

    candidate_lessons: list[str] = []

    # If a specific safe lesson_id was provided, prioritize searching that lesson
    if _is_safe_identifier(lesson_id):
        candidate_lessons.append(lesson_id)

    # Discover other lessons in the course/book
    lessons_dir = _DATA_ROOT / "courses" / target_course / "books" / target_book / "lessons"
    if lessons_dir.is_dir():
        try:
            for entry in sorted(lessons_dir.iterdir()):
                if entry.is_dir() and _is_safe_identifier(entry.name):
                    if entry.name not in candidate_lessons:
                        candidate_lessons.append(entry.name)
        except OSError:
            pass

    scored_items: list[tuple[int, dict]] = []
    seen_ids: set[str] = set()

    for l_id in candidate_lessons:
        vocab_list = _get_lesson_vocabulary(target_course, target_book, l_id)
        for item in vocab_list:
            item_id = str(item.get("id", "")).strip()
            if not item_id or item_id in seen_ids:
                continue

            korean = str(item.get("korean", "")).strip()
            meaning = str(item.get("meaning", "")).strip()

            korean_lower = korean.lower()
            item_id_lower = item_id.lower()
            meaning_lower = meaning.lower()

            # Scoring:
            # 3 = exact match on Korean word or vocabulary ID
            # 2 = exact match on Vietnamese meaning
            # 1 = substring match on Korean word or Vietnamese meaning
            score = 0
            if korean_lower == query_lower or item_id_lower == query_lower:
                score = 3
            elif meaning_lower == query_lower:
                score = 2
            elif query_lower in korean_lower or query_lower in meaning_lower:
                score = 1

            if score > 0:
                seen_ids.add(item_id)
                formatted_item = {
                    "id": item_id,
                    "korean": korean,
                    "meaning": meaning,
                    "partOfSpeech": item.get("partOfSpeech", ""),
                    "examples": item.get("examples", []),
                    "notes": item.get("notes", ""),
                    "lessonId": l_id,
                }
                scored_items.append((score, formatted_item))

    if not scored_items:
        return {
            "found": False,
            "count": 0,
            "items": [],
            "message": "Không tìm thấy từ vựng trong giáo trình Hangul Study.",
        }

    # Sort descending by relevance score, take top 3
    scored_items.sort(key=lambda x: x[0], reverse=True)
    top_items = [item for _, item in scored_items[:3]]

    return {
        "found": True,
        "count": len(top_items),
        "items": top_items,
    }


def lookup_grammar(
    query: str,
    lesson_id: str | None = None,
    course_id: str | None = None,
    book_id: str | None = None,
    **kwargs: Any,
) -> dict:
    """
    Search grammar points in the Hangul Study curriculum by grammar title,
    pattern, meaning, or item ID.

    Returns a structured JSON-serializable dictionary with matching items (max 2).
    """
    if not query or not isinstance(query, str):
        return {
            "found": False,
            "count": 0,
            "items": [],
            "message": "Không tìm thấy điểm ngữ pháp trong giáo trình Hangul Study.",
        }

    clean_query = query.strip()
    if not clean_query or len(clean_query) > 100:
        return {
            "found": False,
            "count": 0,
            "items": [],
            "message": "Không tìm thấy điểm ngữ pháp trong giáo trình Hangul Study.",
        }

    query_lower = clean_query.lower()
    query_stripped = re.sub(r"[?!.,/()]+", " ", query_lower).strip()

    target_course = course_id if _is_safe_identifier(course_id) else "tong-hop"
    target_book = book_id if _is_safe_identifier(book_id) else "book-01"

    candidate_lessons: list[str] = []

    # If a specific safe lesson_id was provided, prioritize searching that lesson
    if _is_safe_identifier(lesson_id):
        candidate_lessons.append(lesson_id)

    # Discover other lessons in the course/book
    lessons_dir = _DATA_ROOT / "courses" / target_course / "books" / target_book / "lessons"
    if lessons_dir.is_dir():
        try:
            for entry in sorted(lessons_dir.iterdir()):
                if entry.is_dir() and _is_safe_identifier(entry.name):
                    if entry.name not in candidate_lessons:
                        candidate_lessons.append(entry.name)
        except OSError:
            pass

    scored_items: list[tuple[int, dict]] = []
    seen_ids: set[str] = set()

    for l_id in candidate_lessons:
        grammar_list = _get_lesson_grammar(target_course, target_book, l_id)
        for item in grammar_list:
            item_id = str(item.get("id", "")).strip()
            if not item_id or item_id in seen_ids:
                continue

            title = str(item.get("title", "")).strip()
            pattern = str(item.get("pattern", "")).strip()
            meaning = str(item.get("meaning", "")).strip()

            title_lower = title.lower()
            pattern_lower = pattern.lower()
            meaning_lower = meaning.lower()
            item_id_lower = item_id.lower()
            title_stripped = re.sub(r"[?!.,/()]+", " ", title_lower).strip()

            score = 0
            # Exact title or ID match (highest priority)
            if query_lower == title_lower or query_lower == item_id_lower:
                score = 5
            # Exact pattern match
            elif query_lower == pattern_lower:
                score = 4
            # Punctuation-normalized title match or substring in title
            elif query_stripped and (query_stripped == title_stripped or query_lower in title_lower):
                score = 3
            # Meaning match
            elif query_lower == meaning_lower or query_lower in meaning_lower:
                score = 2
            # Substring match in pattern
            elif query_lower in pattern_lower:
                score = 1

            # Check particle/slash separated parts in title (e.g. '은' or '는' in '은/는 (Tiểu từ chủ đề)')
            if score == 0:
                sub_parts = [p.strip().lower() for p in re.split(r"[/,()]", title) if p.strip()]
                if query_lower in sub_parts:
                    score = 3

            if score > 0:
                seen_ids.add(item_id)
                formatted_item = {
                    "id": item_id,
                    "lessonId": l_id,
                    "title": title,
                    "pattern": pattern,
                    "meaning": meaning,
                    "explanation": str(item.get("explanation", "")).strip(),
                    "structure": str(item.get("structure", "")).strip(),
                    "examples": item.get("examples", []),
                    "notes": str(item.get("notes", "")).strip(),
                }
                scored_items.append((score, formatted_item))

    if not scored_items:
        return {
            "found": False,
            "count": 0,
            "items": [],
            "message": "Không tìm thấy điểm ngữ pháp trong giáo trình Hangul Study.",
        }

    # Sort descending by relevance score, take top 2
    scored_items.sort(key=lambda x: x[0], reverse=True)
    top_items = [item for _, item in scored_items[:2]]

    return {
        "found": True,
        "count": len(top_items),
        "items": top_items,
    }


LOOKUP_VOCABULARY_TOOL = {
    "type": "function",
    "name": "lookup_vocabulary",
    "description": (
        "Tra cứu thông tin từ vựng trong giáo trình Hangul Study theo từ tiếng Hàn, "
        "nghĩa tiếng Việt hoặc mã từ vựng (ID). "
        "Sử dụng công cụ này khi người học hỏi về nghĩa, cách dùng, ví dụ câu, hoặc thông tin "
        "của một từ vựng tiếng Hàn cụ thể trong giáo trình Hangul Study. "
        "Không dùng công cụ này cho các câu chào hỏi hoặc câu hỏi chung không liên quan đến tra cứu từ vựng."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "Từ tiếng Hàn (ví dụ: '한국'), nghĩa tiếng Việt (ví dụ: 'Hàn Quốc'), "
                    "hoặc mã từ vựng (ví dụ: 'L01-V001') cần tra cứu."
                ),
            },
            "lesson_id": {
                "type": "string",
                "description": (
                    "Mã bài học để ưu tiên tìm kiếm trong bài học cụ thể (ví dụ: 'lesson-01'). "
                    "Nếu không có thì bỏ trống."
                ),
            },
        },
        "required": ["query"],
    },
}


LOOKUP_GRAMMAR_TOOL = {
    "type": "function",
    "name": "lookup_grammar",
    "description": (
        "Tra cứu điểm ngữ pháp trong giáo trình Hangul Study theo tên ngữ pháp (ví dụ: '입니다', '입니까?', '은/는'), "
        "cấu trúc/mẫu câu (ví dụ: 'Danh từ + 입니다'), ý nghĩa (ví dụ: 'tiểu từ chủ đề', 'Là...'), "
        "hoặc mã định danh ngữ pháp (ví dụ: 'L01-G001'). "
        "Sử dụng công cụ này khi người học hỏi về cấu trúc, cách dùng, quy tắc kết hợp, ý nghĩa, hoặc câu ví dụ "
        "của một điểm ngữ pháp tiếng Hàn cụ thể trong giáo trình Hangul Study. "
        "Không dùng công cụ này cho các câu chào hỏi hoặc câu hỏi chung không liên quan đến ngữ pháp."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "Tên ngữ pháp (ví dụ: '입니다', '입니까?', '은/는'), "
                    "cấu trúc (ví dụ: 'Danh từ + 입니다'), ý nghĩa, hoặc mã ngữ pháp cần tra cứu."
                ),
            },
            "lesson_id": {
                "type": "string",
                "description": "Mã bài học để ưu tiên tìm kiếm (ví dụ: 'lesson-01'). Nếu không có thì bỏ trống.",
            },
        },
        "required": ["query"],
    },
}


def _build_prompt(message: str, context: dict) -> str:
    """
    Build a context-aware prompt for Gemini.

    If a content item can be looked up from the local data files, its details
    (word, meaning, examples, notes) are included in the prompt so the AI can
    give an accurate, textbook-aligned answer.

    If no content is found (e.g. the user opened /ai-tutor directly without
    a specific item), the prompt falls back to a general lesson context.
    """
    module = context.get("module")
    lesson_id = context.get("lessonId")
    content = _load_content(context)

    context_lines: list[str] = []

    if lesson_id:
        context_lines.append(f"- Bài học: {lesson_id}")

    if module:
        context_lines.append(f"- Loại nội dung: {module}")

    if content:
        if module == "vocabulary":
            context_lines.append(f"- Từ tiếng Hàn: {content.get('korean', '')}")
            context_lines.append(f"- Nghĩa tiếng Việt: {content.get('meaning', '')}")
            if content.get("partOfSpeech"):
                context_lines.append(f"- Từ loại: {content.get('partOfSpeech')}")
            examples = content.get("examples", [])
            if examples:
                ex = examples[0]
                context_lines.append(
                    f"- Câu ví dụ: {ex.get('korean', '')} → {ex.get('translation', '')}"
                )
            if content.get("notes"):
                context_lines.append(f"- Ghi chú: {content.get('notes')}")

        elif module == "grammar":
            context_lines.append(f"- Điểm ngữ pháp: {content.get('title', '')}")
            context_lines.append(f"- Cấu trúc: {content.get('pattern', '')}")
            context_lines.append(f"- Ý nghĩa: {content.get('meaning', '')}")
            if content.get("explanation"):
                context_lines.append(f"- Giải thích: {content.get('explanation')}")
            examples = content.get("examples", [])
            if examples:
                ex = examples[0]
                context_lines.append(
                    f"- Câu ví dụ: {ex.get('korean', '')} → {ex.get('translation', '')}"
                )
            if content.get("notes"):
                context_lines.append(f"- Ghi chú: {content.get('notes')}")

    context_block = (
        "\n".join(context_lines)
        if context_lines
        else "(Người dùng hỏi câu hỏi chung, không có ngữ cảnh bài học cụ thể)"
    )

    VN_TIMEZONE = timezone(timedelta(hours=7))
    current_time_vn = datetime.now(VN_TIMEZONE).strftime("%d/%m/%Y %H:%M:%S")

    return f"""Bạn là AI Tutor của website học tiếng Hàn Hangul Study.
Thời gian hiện tại: {current_time_vn}

Ngữ cảnh học tập hiện tại:
{context_block}

Câu hỏi của người học:
{message}

Hướng dẫn:
- Trả lời bằng tiếng Việt, giải thích ngắn gọn, dễ hiểu cho người mới học tiếng Hàn.
- Nếu thông tin từ vựng hoặc ngữ pháp đã có đầy đủ trong phần Ngữ cảnh học tập ở trên hoặc đã được giải thích trong các lượt trò chuyện trước đó, hãy sử dụng lại thông tin đó để trả lời hoặc đưa thêm ví dụ mà không cần gọi lại công cụ.
- Khi người học hỏi về nghĩa, cách dùng, ví dụ của từ vựng tiếng Hàn cụ thể chưa có trong ngữ cảnh trên, hãy sử dụng công cụ lookup_vocabulary.
- Khi người học hỏi về cấu trúc, cách dùng, ý nghĩa, quy tắc kết hợp hoặc ví dụ của điểm ngữ pháp tiếng Hàn cụ thể chưa có trong ngữ cảnh trên, hãy sử dụng công cụ lookup_grammar.
- Đối với câu hỏi giao tiếp thông thường hoặc câu hỏi chung, hãy trả lời trực tiếp mà không gọi công cụ.
- Khi có kết quả từ giáo trình qua công cụ, hãy ưu tiên sử dụng thông tin và ví dụ chuẩn đó để giải thích.
- Tuyệt đối không tự bịa đặt thông tin giáo trình. Nếu công cụ không tìm thấy, hãy nêu rõ rằng nội dung chưa có trong giáo trình Hangul Study hiện tại và giải thích ngắn gọn theo kiến thức chuẩn."""


def _extract_text(interaction: Any) -> str:
    """Helper to safely extract the model's text response."""
    if getattr(interaction, "output_text", None):
        return interaction.output_text
    for step in reversed(getattr(interaction, "steps", []) or []):
        if getattr(step, "type", None) == "model_output":
            contents = getattr(step, "content", []) or []
            texts = []
            for c in contents:
                if isinstance(c, dict):
                    texts.append(c.get("text", ""))
                elif hasattr(c, "text"):
                    texts.append(c.text)
            combined = "".join(texts).strip()
            if combined:
                return combined
    return ""


def ask_gemini(
    message: str,
    context: dict,
    previous_interaction_id: str | None = None,
) -> tuple[str, str]:
    """
    Query Gemini model with learning context and optional previous interaction ID.

    Returns:
        tuple[str, str]: (answer_text, last_interaction_id)
    """
    tools = [LOOKUP_VOCABULARY_TOOL, LOOKUP_GRAMMAR_TOOL]

    # Turn 1: Send user message, context, and registered tools
    if previous_interaction_id:
        try:
            interaction = client.interactions.create(
                model="gemini-3.1-flash-lite",
                input=message,
                tools=tools,
                previous_interaction_id=previous_interaction_id,
                generation_config={"thinking_level": "low"},
            )
        except Exception:
            # Fallback to fresh prompt if previous interaction is expired or invalid
            prompt = _build_prompt(message, context)
            interaction = client.interactions.create(
                model="gemini-3.1-flash-lite",
                input=prompt,
                tools=tools,
                generation_config={"thinking_level": "low"},
            )
    else:
        prompt = _build_prompt(message, context)
        interaction = client.interactions.create(
            model="gemini-3.1-flash-lite",
            input=prompt,
            tools=tools,
            generation_config={"thinking_level": "low"},
        )

    # Inspect interaction steps for a function_call step
    fc_step = next(
        (s for s in (getattr(interaction, "steps", []) or []) if getattr(s, "type", None) == "function_call"),
        None,
    )

    if not fc_step:
        last_id = getattr(interaction, "id", None) or ""
        return _extract_text(interaction), last_id

    # Process tool call (maximum ONE tool-call round)
    tool_name = getattr(fc_step, "name", None)
    call_id = getattr(fc_step, "id", None) or getattr(fc_step, "call_id", None) or "call_1"

    if tool_name == "lookup_vocabulary":
        raw_args = getattr(fc_step, "arguments", {})
        args = raw_args if isinstance(raw_args, dict) else {}
        query = str(args.get("query", "")).strip()
        lesson_id = args.get("lesson_id") or context.get("lessonId")

        tool_result = lookup_vocabulary(
            query=query,
            lesson_id=lesson_id,
            course_id=context.get("courseId"),
            book_id=context.get("bookId"),
        )
    elif tool_name == "lookup_grammar":
        raw_args = getattr(fc_step, "arguments", {})
        args = raw_args if isinstance(raw_args, dict) else {}
        query = str(args.get("query", "")).strip()
        lesson_id = args.get("lesson_id") or context.get("lessonId")

        tool_result = lookup_grammar(
            query=query,
            lesson_id=lesson_id,
            course_id=context.get("courseId"),
            book_id=context.get("bookId"),
        )
    else:
        tool_result = {"error": f"Tool '{tool_name}' is not supported."}

    # Turn 2: Send function_result back to Gemini using previous_interaction_id
    function_result_input = [
        {
            "type": "function_result",
            "name": tool_name,
            "call_id": call_id,
            "result": [{"type": "text", "text": json.dumps(tool_result, ensure_ascii=False)}],
        }
    ]

    final_interaction = client.interactions.create(
        model="gemini-3.1-flash-lite",
        input=function_result_input,
        tools=tools,
        previous_interaction_id=interaction.id,
        generation_config={"thinking_level": "low"},
    )

    last_id = getattr(final_interaction, "id", None) or getattr(interaction, "id", None) or ""
    return _extract_text(final_interaction), last_id