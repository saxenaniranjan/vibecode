"use client";

import { useState, useRef, useEffect } from "react";

export default function Typewriter() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setText((prev) => prev + "\n");
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      setText((prev) => prev.slice(0, -1));
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setText((prev) => prev + e.key);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setText((prev) => prev + e.clipboardData.getData("text"));
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4 sm:p-8">
      <div className="relative w-full max-w-2xl" onClick={() => inputRef.current?.focus()}>
        {/* Typewriter - line art SVG */}
        <svg
          viewBox="0 0 500 320"
          className="w-full h-auto drop-shadow-lg"
          style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))" }}
        >
          {/* Paper slot background (cream) */}
          <rect x="80" y="55" width="340" height="140" rx="2" fill="#faf8f3" stroke="#1a1a1a" strokeWidth="1.5" />
          {/* Main body */}
          <path
            d="M 40 200 L 40 260 L 460 260 L 460 200 L 420 200 L 420 75 L 80 75 L 80 200 Z"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
          {/* Keyboard base */}
          <rect x="70" y="265" width="360" height="25" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          {/* Key rows - simple lines */}
          <line x1="90" y1="245" x2="410" y2="245" stroke="#1a1a1a" strokeWidth="1" />
          <line x1="90" y1="230" x2="410" y2="230" stroke="#1a1a1a" strokeWidth="1" />
          <line x1="90" y1="215" x2="410" y2="215" stroke="#1a1a1a" strokeWidth="1" />
          {/* Carriage / roller left */}
          <circle cx="95" cy="135" r="18" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          <circle cx="95" cy="135" r="8" fill="none" stroke="#1a1a1a" strokeWidth="1" />
          {/* Carriage / roller right */}
          <circle cx="405" cy="135" r="18" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          <circle cx="405" cy="135" r="8" fill="none" stroke="#1a1a1a" strokeWidth="1" />
          {/* Top bar */}
          <rect x="75" y="50" width="350" height="12" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          {/* Paper guide lines */}
          <line x1="100" y1="75" x2="400" y2="75" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.6" />
          <line x1="100" y1="95" x2="400" y2="95" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.4" />
        </svg>

        {/* Paper area - typing surface */}
        <div
          className="absolute left-[18%] top-[20%] right-[18%] bottom-[38%] flex items-start overflow-hidden pointer-events-none"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          <div className="w-full h-full px-4 py-3 text-[#1a1a1a] text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words overflow-y-auto">
            {text}
            <span className="inline-block w-0.5 h-5 bg-[#1a1a1a] ml-0.5 animate-pulse align-text-bottom" />
          </div>
        </div>

        {/* Invisible textarea over paper to capture keyboard - same area as paper */}
        <textarea
          ref={inputRef}
          value={text}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="absolute left-[18%] top-[20%] right-[18%] bottom-[38%] opacity-0 cursor-text resize-none border-0 bg-transparent p-0 text-transparent caret-transparent focus:outline-none"
          tabIndex={0}
          aria-label="Type here"
          spellCheck={false}
        />
      </div>

      <p className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm text-stone-500">
        Click the typewriter and start typing
      </p>
    </div>
  );
}
