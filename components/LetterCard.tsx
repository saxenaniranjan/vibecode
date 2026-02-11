"use client";

import { PAPER_COLOR_META } from "@/lib/device";
import type { LetterRecord } from "@/lib/types";

type LetterCardProps = {
  letter: LetterRecord;
  active: boolean;
  onOpen: (letter: LetterRecord) => void;
  onDelete: (letterId: string) => void;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function previewText(content: string): string {
  if (!content.trim()) {
    return "(Blank letter)";
  }

  return content.length > 140 ? `${content.slice(0, 140).trim()}...` : content;
}

export default function LetterCard({ letter, active, onOpen, onDelete }: LetterCardProps) {
  const paperMeta = PAPER_COLOR_META[letter.paperColor];

  return (
    <article
      className={`rounded-xl border bg-[#fff9ef] p-4 shadow-sm transition ${
        active
          ? "border-[#6f553c] shadow-[0_10px_25px_rgba(69,51,33,0.2)]"
          : "border-[#b89e83]/45 hover:border-[#917355]"
      }`}
    >
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onOpen(letter)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.16em] text-[#6b533d]">
            {formatDate(letter.updatedAt)}
          </span>
          <div className="flex items-center gap-1">
            {letter.isFinished ? (
              <span className="rounded-full border border-[#8b6d50]/45 bg-[#f0dfc7] px-2 py-0.5 text-[0.58rem] uppercase tracking-wide text-[#4d3928]">
                Finished
              </span>
            ) : null}
            <span
              className="rounded-full border px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-[#483625]"
              style={{ backgroundColor: paperMeta.swatch }}
            >
              {paperMeta.label}
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-[#3b2e22]">
          {previewText(letter.content)}
        </p>
      </button>

      <div className="mt-3 flex items-center justify-between text-xs text-[#6b533d]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            {letter.isBookmarked ? "★" : "☆"}
            {letter.isBookmarked ? "Bookmarked" : "Bookmark"}
          </span>
          <span>📎 {letter.images.length}</span>
        </div>

        <button
          type="button"
          className="rounded-md border border-[#9a7d60]/50 px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] text-[#6d513a] transition hover:bg-[#f2e6d4]"
          onClick={() => onDelete(letter.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
