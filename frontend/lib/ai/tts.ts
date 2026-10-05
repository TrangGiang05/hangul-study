/**
 * Text-to-Speech (TTS) utilities for Korean pronunciation in Hangul Study.
 * Powered by Web Speech API (window.speechSynthesis).
 */

const HANGUL_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/;
const LATIN_OR_VIETNAMESE_REGEX = /[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

/**
 * Check if the browser supports SpeechSynthesis.
 */
export function isTTSSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * Attempt to locate an installed Korean voice on the browser.
 * Returns null if not found (speechSynthesis will still fallback using lang = "ko-KR").
 */
export function getKoreanVoice(): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "ko-KR" || v.lang === "ko_KR") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("ko")) ||
    null
  );
}

/**
 * Stop any ongoing speech playback.
 */
export function stopSpeech(): void {
  if (!isTTSSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser errors during cancel
  }
}

/**
 * Determine suitable speech rate for Korean learners:
 * - Single words or short phrases: 0.85
 * - Full sentences or combined texts: 0.75 for beginner clarity and shadowing
 */
export function getKoreanSpeechRate(text: string): number {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const hasSentencePunctuation = /[.!?]/.test(trimmed);

  const isSentence =
    words.length >= 3 ||
    (words.length >= 2 && hasSentencePunctuation) ||
    trimmed.includes(". ");

  return isSentence ? 0.75 : 0.85;
}

/**
 * Speak a Korean text snippet using Web Speech API.
 * Returns a cancel cleanup function.
 */
export function speakKorean(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    rate?: number;
  }
): () => void {
  if (!isTTSSupported() || !text.trim()) {
    callbacks?.onError?.();
    return () => {};
  }

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = "ko-KR";
  utterance.rate = callbacks?.rate ?? getKoreanSpeechRate(text);

  const voice = getKoreanVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => callbacks?.onStart?.();
  utterance.onend = () => callbacks?.onEnd?.();
  utterance.onerror = () => callbacks?.onError?.();

  try {
    window.speechSynthesis.speak(utterance);
  } catch {
    callbacks?.onError?.();
  }

  return () => {
    stopSpeech();
  };
}

/**
 * Extract Korean phrases and sentences from an AI response text.
 * Filters out Vietnamese explanations, markdown formatting, and non-Korean text.
 */
export function extractKoreanPhrases(text: string): string[] {
  if (!text || !HANGUL_REGEX.test(text)) return [];

  // Strip markdown styling (bold, italic, code, headings, blockquotes)
  const stripped = text
    .replace(/[*_`#]/g, "")
    .replace(/^>\s+/gm, "");

  const lines = stripped.split("\n");
  const extracted: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || !HANGUL_REGEX.test(trimmedLine)) continue;

    // Remove leading list markers: "- ", "1. ", "* "
    const withoutMarker = trimmedLine.replace(/^[-*•\d.]+\s*/, "");

    // Split by common separators separating Korean from Vietnamese translation
    const segments = withoutMarker.split(/[→:()（）]/);
    for (let seg of segments) {
      seg = seg.trim().replace(/^[-–—]\s*/, "").trim();

      // Check if this segment contains Korean and has NO Latin/Vietnamese letters
      if (seg && HANGUL_REGEX.test(seg) && !LATIN_OR_VIETNAMESE_REGEX.test(seg)) {
        // Clean leading/trailing non-Korean symbols except standard punctuation
        const cleaned = seg.replace(/^[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+/, "").trim();
        if (cleaned && HANGUL_REGEX.test(cleaned)) {
          extracted.push(cleaned);
        }
      }
    }

    // Also check for inline Korean words or short phrases that might not be separated by punctuation
    const inlineMatches =
      trimmedLine.match(
        /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F][\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F0-9\s.,?!~'"-]*[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F.?!]|[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+/g
      ) || [];

    for (const m of inlineMatches) {
      const cleanM = m.trim();
      if (cleanM && HANGUL_REGEX.test(cleanM) && !LATIN_OR_VIETNAMESE_REGEX.test(cleanM)) {
        const alreadyCovered = extracted.some((e) => e.includes(cleanM));
        if (!alreadyCovered && cleanM.length > 1) {
          extracted.push(cleanM);
        }
      }
    }
  }

  // Deduplicate and filter out trivial fragments
  const finalResults: string[] = [];
  for (const item of extracted) {
    const trimmed = item.trim();
    if (trimmed.length > 0 && !finalResults.includes(trimmed)) {
      finalResults.push(trimmed);
    }
  }

  return finalResults;
}
