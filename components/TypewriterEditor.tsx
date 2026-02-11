"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ArchivePanel from "@/components/ArchivePanel";
import DeviceSetup from "@/components/DeviceSetup";
import {
  clearStoredDeviceId,
  getStoredDeviceId,
  PAPER_COLOR_META,
  type PaperColor,
} from "@/lib/device";
import type { DeviceRecord, LetterListResponse, LetterRecord } from "@/lib/types";

const SAVE_DEBOUNCE_MS = 1800;
const SAVE_INTERVAL_MS = 5000;

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
type MotionState = "idle" | "typing" | "return";

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatSaveMessage(saveState: SaveState, updatedAt: string | null): string {
  if (saveState === "saving") {
    return "Saving...";
  }

  if (saveState === "dirty") {
    return "Unsaved changes";
  }

  if (saveState === "error") {
    return "Save failed";
  }

  if (saveState === "saved" && updatedAt) {
    const timestamp = new Date(updatedAt);
    const formatted = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(timestamp);
    return `Saved ${formatted}`;
  }

  return "Ready";
}

export default function TypewriterEditor() {
  const [isBooting, setIsBooting] = useState(true);
  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [activeLetter, setActiveLetter] = useState<LetterRecord | null>(null);
  const [content, setContent] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveRefreshToken, setArchiveRefreshToken] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [motionState, setMotionState] = useState<MotionState>("idle");
  const [notice, setNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const contentRef = useRef(content);
  const deviceRef = useRef<DeviceRecord | null>(device);
  const activeLetterRef = useRef<LetterRecord | null>(activeLetter);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inFlightSaveRef = useRef(false);
  const queuedSaveRef = useRef(false);
  const suppressAutosaveRef = useRef(false);
  const lastPersistedContentRef = useRef("");

  const typingSoundVariantPoolsRef = useRef<HTMLAudioElement[][]>([]);
  const returnSoundRef = useRef<HTMLAudioElement | null>(null);
  const bellSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    deviceRef.current = device;
  }, [device]);

  useEffect(() => {
    activeLetterRef.current = activeLetter;
  }, [activeLetter]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const typingVariants = [
      "/sounds/typewriter-soft-click.wav",
      "/sounds/typewriter-soft-hit.wav",
      "/sounds/typewriter-hit-1369.wav",
    ];

    typingSoundVariantPoolsRef.current = typingVariants.map((url) =>
      Array.from({ length: 4 }, () => {
        const audio = new Audio(url);
        audio.volume = 0.38;
        audio.preload = "auto";
        return audio;
      })
    );

    returnSoundRef.current = new Audio("/sounds/typewriter-return.mp3");
    returnSoundRef.current.volume = 0.45;
    returnSoundRef.current.preload = "auto";
    returnSoundRef.current.load();

    bellSoundRef.current = new Audio("/sounds/typewriter-bell.mp3");
    bellSoundRef.current.volume = 0.56;
    bellSoundRef.current.preload = "auto";
    bellSoundRef.current.load();
  }, []);

  const playTypingSound = useCallback(() => {
    const pools = typingSoundVariantPoolsRef.current;
    if (!pools.length) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * pools.length);
    const selectedPool = pools[randomIndex];
    const next =
      selectedPool.find((audio) => audio.paused || audio.ended) ?? selectedPool[0];
    next.currentTime = 0;
    void next.play().catch(() => {
      // Ignore autoplay/sound errors.
    });
  }, []);

  const playReturnSound = useCallback(() => {
    const audio = returnSoundRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore autoplay/sound errors.
    });
  }, []);

  const playBellSound = useCallback(() => {
    const audio = bellSoundRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore autoplay/sound errors.
    });
  }, []);

  const pulseMotion = useCallback((next: MotionState, durationMs: number) => {
    setMotionState(next);

    if (motionTimerRef.current) {
      clearTimeout(motionTimerRef.current);
    }

    motionTimerRef.current = setTimeout(() => {
      setMotionState("idle");
    }, durationMs);
  }, []);

  const scrollPaperUp = useCallback(() => {
    const textarea = editorTextAreaRef.current;
    if (!textarea) {
      return;
    }

    textarea.scrollTop = textarea.scrollHeight;
  }, []);

  useEffect(() => {
    scrollPaperUp();
  }, [content, scrollPaperUp]);

  const flashNotice = useCallback((message: string) => {
    setNotice(message);

    if (noticeTimerRef.current) {
      clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = setTimeout(() => {
      setNotice(null);
    }, 2400);
  }, []);

  const hydrateEditor = useCallback((letter: LetterRecord) => {
    suppressAutosaveRef.current = true;
    setActiveLetter(letter);
    setContent(letter.content);
    setSaveState("saved");
    setLastSavedAt(letter.updatedAt);
    lastPersistedContentRef.current = letter.content;
  }, []);

  const clearEditor = useCallback(() => {
    suppressAutosaveRef.current = true;
    setActiveLetter(null);
    setContent("");
    setSaveState("idle");
    setLastSavedAt(null);
    lastPersistedContentRef.current = "";
  }, []);

  const loadLatestLetterForDevice = useCallback(
    async (deviceId: string) => {
      try {
        const params = new URLSearchParams({
          authorDeviceId: deviceId,
          page: "1",
          pageSize: "1",
        });

        const response = await fetch(`/api/letters?${params.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          clearEditor();
          return;
        }

        const payload = (await response.json()) as LetterListResponse;

        if (payload.items.length > 0) {
          hydrateEditor(payload.items[0]);
        } else {
          clearEditor();
        }
      } catch {
        clearEditor();
      }
    },
    [clearEditor, hydrateEditor]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedDeviceId = getStoredDeviceId();

      if (!storedDeviceId) {
        setIsBooting(false);
        return;
      }

      try {
        const response = await fetch(`/api/devices/${storedDeviceId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not restore device.");
        }

        const payload = (await response.json()) as { device: DeviceRecord };

        if (cancelled) {
          return;
        }

        setDevice(payload.device);
        await loadLatestLetterForDevice(payload.device.id);
      } catch {
        clearStoredDeviceId();
        if (!cancelled) {
          setDevice(null);
          clearEditor();
        }
      } finally {
        if (!cancelled) {
          setIsBooting(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearEditor, loadLatestLetterForDevice]);

  const persistLetter = useCallback(async (): Promise<LetterRecord | null> => {
    const currentDevice = deviceRef.current;
    const currentContent = contentRef.current;
    const currentLetter = activeLetterRef.current;

    if (!currentDevice) {
      return null;
    }

    if (!currentLetter && !currentContent.trim()) {
      setSaveState("idle");
      return null;
    }

    if (inFlightSaveRef.current) {
      queuedSaveRef.current = true;
      return currentLetter;
    }

    inFlightSaveRef.current = true;
    setSaveState("saving");

    try {
      let response: Response;

      if (currentLetter) {
        response = await fetch(`/api/letters/${currentLetter.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: currentContent }),
        });
      } else {
        response = await fetch("/api/letters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorDeviceId: currentDevice.id,
            content: currentContent,
            isBookmarked: false,
            isFinished: false,
          }),
        });
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to save letter");
      }

      const payload = (await response.json()) as { letter: LetterRecord };

      setActiveLetter(payload.letter);
      setSaveState("saved");
      setLastSavedAt(payload.letter.updatedAt);
      lastPersistedContentRef.current = payload.letter.content;
      setArchiveRefreshToken((prev) => prev + 1);

      return payload.letter;
    } catch (error) {
      setSaveState("error");
      flashNotice(toErrorMessage(error, "Unable to save."));
      return null;
    } finally {
      inFlightSaveRef.current = false;

      if (queuedSaveRef.current) {
        queuedSaveRef.current = false;
        void persistLetter();
      }
    }
  }, [flashNotice]);

  const updateLetterFields = useCallback(
    async (letterId: string, fields: { isBookmarked?: boolean; isFinished?: boolean }) => {
      const response = await fetch(`/api/letters/${letterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentRef.current,
          ...fields,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to update letter");
      }

      const payload = (await response.json()) as { letter: LetterRecord };
      setActiveLetter(payload.letter);
      setLastSavedAt(payload.letter.updatedAt);
      setSaveState("saved");
      lastPersistedContentRef.current = payload.letter.content;
      setArchiveRefreshToken((prev) => prev + 1);

      return payload.letter;
    },
    []
  );

  useEffect(() => {
    if (!device) {
      return;
    }

    if (suppressAutosaveRef.current) {
      suppressAutosaveRef.current = false;
      return;
    }

    if (content === lastPersistedContentRef.current) {
      return;
    }

    setSaveState("dirty");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      void persistLetter();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, device, persistLetter]);

  useEffect(() => {
    if (!device) {
      return;
    }

    const interval = setInterval(() => {
      if (contentRef.current !== lastPersistedContentRef.current) {
        void persistLetter();
      }
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [device, persistLetter]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (motionTimerRef.current) {
        clearTimeout(motionTimerRef.current);
      }
      if (noticeTimerRef.current) {
        clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const handleSetupComplete = useCallback(
    async (nextDevice: DeviceRecord) => {
      setDevice(nextDevice);
      await loadLatestLetterForDevice(nextDevice.id);
      setIsBooting(false);
    },
    [loadLatestLetterForDevice]
  );

  const handleSelectLetter = useCallback(
    (letter: LetterRecord) => {
      hydrateEditor(letter);
      setArchiveOpen(false);
    },
    [hydrateEditor]
  );

  const handleDeleteLetter = useCallback(
    async (letterId: string) => {
      const confirmed = window.confirm("Delete this letter permanently?");
      if (!confirmed) {
        return;
      }

      try {
        const response = await fetch(`/api/letters/${letterId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Unable to delete letter");
        }

        if (activeLetterRef.current?.id === letterId) {
          clearEditor();
        }

        setArchiveRefreshToken((prev) => prev + 1);
      } catch (error) {
        flashNotice(toErrorMessage(error, "Delete failed."));
      }
    },
    [clearEditor, flashNotice]
  );

  const handleToggleBookmark = useCallback(async () => {
    let target = activeLetterRef.current;

    if (!target) {
      target = await persistLetter();
    }

    if (!target) {
      return;
    }

    const nextValue = !target.isBookmarked;
    const optimisticLetter: LetterRecord = { ...target, isBookmarked: nextValue };
    setActiveLetter(optimisticLetter);

    try {
      await updateLetterFields(target.id, { isBookmarked: nextValue });
    } catch (error) {
      setActiveLetter(target);
      flashNotice(toErrorMessage(error, "Bookmark update failed."));
    }
  }, [flashNotice, persistLetter, updateLetterFields]);

  const handleFinishLetter = useCallback(async () => {
    if (!contentRef.current.trim()) {
      flashNotice("Write something before finishing.");
      return;
    }

    let target = activeLetterRef.current;

    if (!target) {
      target = await persistLetter();
    }

    if (!target) {
      flashNotice("Could not finish this letter.");
      return;
    }

    if (target.isFinished) {
      flashNotice("Letter already finished.");
      return;
    }

    try {
      await updateLetterFields(target.id, { isFinished: true });
      playBellSound();
      flashNotice("Letter finished.");
    } catch (error) {
      flashNotice(toErrorMessage(error, "Could not finish letter."));
    }
  }, [flashNotice, persistLetter, playBellSound, updateLetterFields]);

  const handleNewLetter = useCallback(() => {
    clearEditor();
    flashNotice("New letter started.");
  }, [clearEditor, flashNotice]);

  const handleAttachImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) {
        return;
      }

      const currentDevice = deviceRef.current;
      if (!currentDevice) {
        return;
      }

      setIsUploadingImage(true);

      try {
        let targetLetter = activeLetterRef.current;
        if (!targetLetter) {
          targetLetter = await persistLetter();
        }

        if (!targetLetter) {
          throw new Error("Type something first to create a letter.");
        }

        if (targetLetter.images.length >= 1) {
          throw new Error("Only one photo can be attached to a letter.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("letterId", targetLetter.id);
        formData.append("deviceId", currentDevice.id);

        const response = await fetch("/api/images", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? "Image upload failed");
        }

        const payload = (await response.json()) as { letter: LetterRecord };

        setActiveLetter(payload.letter);
        setLastSavedAt(payload.letter.updatedAt);
        setArchiveRefreshToken((prev) => prev + 1);
        flashNotice("Image attached.");
      } catch (error) {
        flashNotice(toErrorMessage(error, "Image upload failed."));
      } finally {
        setIsUploadingImage(false);
      }
    },
    [flashNotice, persistLetter]
  );

  const handleEditorKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.repeat
      ) {
        playTypingSound();
        pulseMotion("typing", 85);
      }

      if (event.key === "Enter" && !event.repeat) {
        playReturnSound();
        pulseMotion("return", 180);
      }

      requestAnimationFrame(() => {
        scrollPaperUp();
      });
    },
    [playReturnSound, playTypingSound, pulseMotion, scrollPaperUp]
  );

  const paperColor: PaperColor =
    activeLetter?.paperColor ?? device?.paperColor ?? "parchment";

  const saveMessage = useMemo(
    () => formatSaveMessage(saveState, lastSavedAt),
    [saveState, lastSavedAt]
  );

  const isFinished = Boolean(activeLetter?.isFinished);

  if (isBooting) {
    return (
      <main className="vintage-desk flex min-h-screen items-center justify-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[#6d5640]">
          Loading desk...
        </p>
      </main>
    );
  }

  return (
    <main className="vintage-desk min-h-screen p-4 sm:p-6 lg:p-8">
      {!device ? <DeviceSetup onComplete={handleSetupComplete} /> : null}

      <h1 className="fixed left-1/2 top-4 z-30 -translate-x-1/2 rounded-full border border-[#8a7158]/40 bg-[#f9f2e4]/95 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.14em] text-[#543f2f] shadow-sm sm:top-6 sm:text-xs">
        Alu&apos;s and Niu&apos;s corner of the internet
      </h1>

      <div className="fixed left-4 top-16 z-30 rounded-full border border-[#8a7158]/40 bg-[#f9f2e4]/95 px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-[#6b533f] shadow-sm sm:left-6 sm:top-6">
        {saveMessage}
      </div>

      <button
        type="button"
        className="fixed right-4 top-16 z-30 rounded-full border border-[#7f6346]/45 bg-[#f9f2e4]/95 p-2 text-[#4b3828] shadow-sm transition hover:bg-[#efe1cb] sm:right-6 sm:top-6"
        aria-label="Open archive"
        onClick={() => setArchiveOpen(true)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <path d="M9 6V4h6v2" />
          <path d="M8 10h8" />
          <path d="M8 14h5" />
        </svg>
      </button>

      <section className="mx-auto flex h-[calc(100vh-5.5rem)] w-full max-w-none items-end justify-center pt-16 sm:h-[calc(100vh-4.5rem)] sm:pt-8">
        <div className="editor-stage">
          <div
            className={`paper-frame paper-frame-stage ${
              PAPER_COLOR_META[paperColor].textureClass
            } ${motionState === "typing" ? "paper-frame-typing" : ""} ${
              motionState === "return" ? "paper-frame-return" : ""
            }`}
          >
            {activeLetter?.images.length ? (
              <div className="photo-rail" aria-label="Attached photos">
                {activeLetter.images.slice(0, 1).map((image) => (
                  <a
                    key={image.id}
                    href={image.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="photo-stack-card"
                    title="Open attached image"
                  >
                    <span className="photo-paperclip" />
                    <span className="photo-frame-shell">
                      <img
                        src={image.imageUrl}
                        alt="Attached"
                        className="photo-frame-image"
                      />
                    </span>
                  </a>
                ))}
              </div>
            ) : null}

            {isFinished ? (
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-[#8c7053]/45 bg-[#f5e5cb]/95 px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-[#5a4431]">
                Finished
              </div>
            ) : null}

            <textarea
              ref={editorTextAreaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              placeholder={isFinished ? "Letter finished" : "Begin your letter..."}
              className="typewriter-editor"
              spellCheck={false}
              readOnly={isFinished}
              style={
                activeLetter?.images.length
                  ? { paddingRight: "10.25rem" }
                  : undefined
              }
              onWheel={(event) => {
                event.preventDefault();
              }}
            />
          </div>

          <div className="machine-controls">
            {isFinished ? (
              <button
                type="button"
                className="machine-control-button"
                onClick={handleNewLetter}
              >
                New Letter
              </button>
            ) : (
              <button
                type="button"
                className="machine-control-button"
                onClick={() => {
                  void handleFinishLetter();
                }}
                disabled={!content.trim() || saveState === "saving"}
              >
                Finish Letter
              </button>
            )}
            <button
              type="button"
              className={`machine-control-button ${
                activeLetter?.isBookmarked ? "machine-control-button-active" : ""
              }`}
              onClick={() => {
                void handleToggleBookmark();
              }}
            >
              {activeLetter?.isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            <button
              type="button"
              className="machine-control-button"
              onClick={handleAttachImage}
              disabled={
                isUploadingImage || isFinished || (activeLetter?.images.length ?? 0) >= 1
              }
            >
              {isUploadingImage
                ? "Uploading..."
                : (activeLetter?.images.length ?? 0) >= 1
                  ? "Photo Added"
                  : "Attach Photo"}
            </button>
          </div>

          <div className="machine-band" aria-hidden="true">
            <img
              src="/images/typewriter-bottom.png"
              alt="Vintage typewriter"
              className={`typewriter-machine-fixed ${
                motionState === "typing" ? "typewriter-machine-fixed-typing" : ""
              } ${motionState === "return" ? "typewriter-machine-fixed-return" : ""}`}
            />
          </div>
        </div>
      </section>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          void handleImageSelected(event);
        }}
      />

      <ArchivePanel
        open={archiveOpen}
        activeLetterId={activeLetter?.id ?? null}
        refreshToken={archiveRefreshToken}
        onClose={() => setArchiveOpen(false)}
        onSelectLetter={handleSelectLetter}
        onDeleteLetter={handleDeleteLetter}
      />

      {notice ? (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-md border border-[#8f7458]/45 bg-[#f8efe0] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#604a35] shadow-md">
          {notice}
        </div>
      ) : null}
    </main>
  );
}
