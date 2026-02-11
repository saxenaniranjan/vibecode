"use client";

import { useCallback, useEffect, useState } from "react";

import type { PaperColor } from "@/lib/device";
import { PAPER_COLOR_META } from "@/lib/device";
import type { LetterListResponse, LetterRecord } from "@/lib/types";
import LetterCard from "@/components/LetterCard";

type ArchivePanelProps = {
  open: boolean;
  activeLetterId: string | null;
  refreshToken: number;
  onClose: () => void;
  onSelectLetter: (letter: LetterRecord) => void;
  onDeleteLetter: (letterId: string) => Promise<void>;
};

type Filters = {
  query: string;
  year: string;
  bookmarked: boolean;
  withImages: boolean;
  paperColor: "all" | PaperColor;
};

const PAGE_SIZE = 12;

const initialFilters: Filters = {
  query: "",
  year: "all",
  bookmarked: false,
  withImages: false,
  paperColor: "all",
};

export default function ArchivePanel({
  open,
  activeLetterId,
  refreshToken,
  onClose,
  onSelectLetter,
  onDeleteLetter,
}: ArchivePanelProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [letters, setLetters] = useState<LetterRecord[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchLetters = useCallback(async (nextPage: number, append: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);

    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("pageSize", String(PAGE_SIZE));

    if (filters.query.trim()) {
      params.set("q", filters.query.trim());
    }

    if (filters.year !== "all") {
      params.set("year", filters.year);
    }

    if (filters.bookmarked) {
      params.set("bookmarked", "true");
    }

    if (filters.withImages) {
      params.set("withImages", "true");
    }

    if (filters.paperColor !== "all") {
      params.set("paperColor", filters.paperColor);
    }

    try {
      const response = await fetch(`/api/letters?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load archive");
      }

      const payload = (await response.json()) as LetterListResponse;

      setLetters((prev) => (append ? [...prev, ...payload.items] : payload.items));
      setYears(payload.years);
      setPage(payload.page);
      setHasMore(payload.hasMore);
      setTotal(payload.total);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load archive.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void fetchLetters(1, false);
  }, [open, refreshToken, fetchLetters]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-[#1e140d]/35 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Close archive"
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#8d6f53]/40 bg-[#f7efdf] shadow-[-12px_0_40px_rgba(24,16,10,0.24)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="border-b border-[#b89d82]/45 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#2f2318]">Archive</h2>
            <button
              type="button"
              className="rounded-md border border-[#9f8264]/50 px-2 py-1 text-xs uppercase tracking-[0.12em] text-[#5f4734] transition hover:bg-[#efe1cc]"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#705640]">
            {total} letters
          </p>
        </header>

        <section className="grid grid-cols-2 gap-2 border-b border-[#b89d82]/45 px-4 py-3 text-xs">
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            placeholder="Search text"
            className="col-span-2 rounded-md border border-[#b19172]/55 bg-[#fcf7ec] px-2 py-1.5 text-sm text-[#3a2a1e] outline-none focus:border-[#7a5f44]"
          />

          <select
            value={filters.year}
            onChange={(event) => updateFilter("year", event.target.value)}
            className="rounded-md border border-[#b19172]/55 bg-[#fcf7ec] px-2 py-1.5 text-[#3a2a1e]"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={filters.paperColor}
            onChange={(event) =>
              updateFilter("paperColor", event.target.value as Filters["paperColor"])
            }
            className="rounded-md border border-[#b19172]/55 bg-[#fcf7ec] px-2 py-1.5 text-[#3a2a1e]"
          >
            <option value="all">All Papers</option>
            {(Object.keys(PAPER_COLOR_META) as PaperColor[]).map((paperColor) => (
              <option key={paperColor} value={paperColor}>
                {PAPER_COLOR_META[paperColor].label}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-[#5f4734]">
            <input
              type="checkbox"
              checked={filters.bookmarked}
              onChange={(event) => updateFilter("bookmarked", event.target.checked)}
            />
            Bookmarked
          </label>

          <label className="inline-flex items-center gap-2 text-[#5f4734]">
            <input
              type="checkbox"
              checked={filters.withImages}
              onChange={(event) => updateFilter("withImages", event.target.checked)}
            />
            With images
          </label>
        </section>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-4">
          {errorMessage ? (
            <p className="rounded-lg border border-[#a75d50]/40 bg-[#ffece8] px-3 py-2 text-sm text-[#8c2a22]">
              {errorMessage}
            </p>
          ) : null}

          {!isLoading && letters.length === 0 ? (
            <p className="rounded-lg border border-[#b89d82]/45 bg-[#fdf9ef] px-3 py-3 text-sm text-[#5f4734]">
              No letters match this filter.
            </p>
          ) : null}

          <div className="space-y-3">
            {letters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                active={activeLetterId === letter.id}
                onOpen={(selected) => {
                  onSelectLetter(selected);
                  onClose();
                }}
                onDelete={(letterId) => {
                  void onDeleteLetter(letterId);
                }}
              />
            ))}
          </div>

          {isLoading ? (
            <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-[#7a6149]">
              Loading...
            </p>
          ) : null}

          {!isLoading && hasMore ? (
            <button
              type="button"
              className="mt-4 w-full rounded-lg border border-[#9f8264]/45 bg-[#f2e4cf] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#4b3828] transition hover:bg-[#ebdcc5]"
              onClick={() => {
                void fetchLetters(page + 1, true);
              }}
            >
              Load more
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
