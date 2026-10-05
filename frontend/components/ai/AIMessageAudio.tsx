"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  extractKoreanPhrases,
  isTTSSupported,
  speakKorean,
  stopSpeech,
} from "../../lib/ai/tts";

type AIMessageAudioProps = {
  text: string;
};

export function AIMessageAudio({ text }: AIMessageAudioProps) {
  const [supported, setSupported] = useState(false);
  const [activePhrase, setActivePhrase] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Check Web Speech API support safely after mounting to avoid SSR mismatch
  useEffect(() => {
    setSupported(isTTSSupported());
  }, []);

  // Extract Korean phrases from markdown content
  const phrases = useMemo(() => extractKoreanPhrases(text), [text]);

  // Cleanup speech when component unmounts
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!supported || phrases.length === 0) {
    return null;
  }

  const allPhrasesCombined = phrases.join(". ");

  function handleToggle(phraseToPlay: string) {
    if (isPlaying && activePhrase === phraseToPlay) {
      stopSpeech();
      setIsPlaying(false);
      setActivePhrase(null);
      return;
    }

    stopSpeech();
    setIsPlaying(true);
    setActivePhrase(phraseToPlay);

    speakKorean(phraseToPlay, {
      onStart: () => {
        setIsPlaying(true);
        setActivePhrase(phraseToPlay);
      },
      onEnd: () => {
        setIsPlaying(false);
        setActivePhrase(null);
      },
      onError: () => {
        setIsPlaying(false);
        setActivePhrase(null);
      },
    });
  }

  return (
    <div
      className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label="Phát âm tiếng Hàn"
    >
      <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mr-0.5 select-none">
        🔊 Phát âm:
      </span>

      {phrases.map((phrase, idx) => {
        const isCurrentPlaying = isPlaying && activePhrase === phrase;
        const displayText =
          phrase.length > 28 ? `${phrase.slice(0, 28)}…` : phrase;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleToggle(phrase)}
            title={isCurrentPlaying ? "Nhấn để dừng phát âm" : `Nghe phát âm: ${phrase}`}
            aria-label={isCurrentPlaying ? `Dừng phát âm ${phrase}` : `Nghe phát âm ${phrase}`}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-all cursor-pointer ${
              isCurrentPlaying
                ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-300 animate-pulse"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 border border-blue-200/70"
            }`}
          >
            <span aria-hidden="true" className="text-[10px]">
              {isCurrentPlaying ? "⏹" : "▶"}
            </span>
            <span className="font-sans">{displayText}</span>
          </button>
        );
      })}

      {phrases.length > 1 && (
        <button
          type="button"
          onClick={() => handleToggle(allPhrasesCombined)}
          title={
            isPlaying && activePhrase === allPhrasesCombined
              ? "Nhấn để dừng phát âm"
              : "Đọc toàn bộ các câu tiếng Hàn"
          }
          aria-label={
            isPlaying && activePhrase === allPhrasesCombined
              ? "Dừng phát âm tất cả"
              : "Đọc toàn bộ các câu tiếng Hàn"
          }
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-all cursor-pointer ${
            isPlaying && activePhrase === allPhrasesCombined
              ? "bg-blue-600 text-white shadow-2xs ring-2 ring-blue-300 animate-pulse"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
          }`}
        >
          <span aria-hidden="true" className="text-[10px]">
            {isPlaying && activePhrase === allPhrasesCombined ? "⏹" : "▶"}
          </span>
          <span>Đọc tất cả</span>
        </button>
      )}
    </div>
  );
}
