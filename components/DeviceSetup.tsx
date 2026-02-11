"use client";

import { useMemo, useState } from "react";

import {
  generateDeviceId,
  PAPER_COLORS,
  PAPER_COLOR_META,
  setStoredDeviceId,
  type PaperColor,
} from "@/lib/device";
import type { DeviceRecord } from "@/lib/types";

type DeviceSetupProps = {
  onComplete: (device: DeviceRecord) => void;
};

export default function DeviceSetup({ onComplete }: DeviceSetupProps) {
  const [selectedColor, setSelectedColor] = useState<PaperColor>("parchment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const buttonLabel = useMemo(() => {
    if (isSubmitting) {
      return "Saving";
    }

    return "Enter Writing Desk";
  }, [isSubmitting]);

  const handleContinue = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const deviceId = generateDeviceId();
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deviceId, paperColor: selectedColor }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Unable to register this device.");
      }

      const payload = (await response.json()) as { device: DeviceRecord };

      setStoredDeviceId(payload.device.id);
      onComplete(payload.device);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1710]/35 p-6 backdrop-blur-[2px]">
      <section className="w-full max-w-lg rounded-2xl border border-[#8a6f53]/35 bg-[#f8f1df] p-6 shadow-[0_22px_55px_rgba(36,23,13,0.3)] sm:p-8">
        <p className="text-center text-xs uppercase tracking-[0.24em] text-[#69543f]">
          Device Setup
        </p>
        <h1 className="mt-3 text-center font-serif text-3xl text-[#2f2217]">
          Choose your paper
        </h1>
        <p className="mt-2 text-center text-sm text-[#5a4534]">
          This browser becomes one writer device. The color marks who wrote each
          letter.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAPER_COLORS.map((color) => {
            const meta = PAPER_COLOR_META[color];
            const isSelected = selectedColor === color;

            return (
              <button
                key={color}
                type="button"
                className={`rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#5f4a34] bg-[#efe4cd] shadow-[inset_0_0_0_1px_rgba(48,35,23,0.18)]"
                    : "border-[#a78b6f]/45 bg-[#fbf6ea] hover:border-[#856649]"
                }`}
                onClick={() => setSelectedColor(color)}
                aria-pressed={isSelected}
              >
                <div
                  className="h-16 rounded-md border border-[#8a6f53]/40"
                  style={{ backgroundColor: meta.swatch }}
                />
                <p className="mt-3 text-sm font-medium text-[#3b2b1e]">
                  {meta.label}
                </p>
              </button>
            );
          })}
        </div>

        {errorMessage ? (
          <p className="mt-4 text-center text-sm text-[#8d2b24]">{errorMessage}</p>
        ) : null}

        <button
          type="button"
          className="mt-8 w-full rounded-xl bg-[#2f241a] px-4 py-3 text-sm uppercase tracking-[0.18em] text-[#f8efdf] transition hover:bg-[#3b2d21] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          {buttonLabel}
        </button>
      </section>
    </div>
  );
}
