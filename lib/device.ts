export const DEVICE_STORAGE_KEY = "vintage_letters_device_id";

export const PAPER_COLORS = ["parchment", "rose"] as const;

export type PaperColor = (typeof PAPER_COLORS)[number];

export const PAPER_COLOR_META: Record<
  PaperColor,
  { label: string; swatch: string; textureClass: string }
> = {
  parchment: {
    label: "Parchment",
    swatch: "#f7ecd2",
    textureClass: "paper-parchment",
  },
  rose: {
    label: "Blush",
    swatch: "#f3dfd6",
    textureClass: "paper-rose",
  },
};

export function isPaperColor(value: string): value is PaperColor {
  return PAPER_COLORS.includes(value as PaperColor);
}

export function generateDeviceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (symbol) => {
    const random = Math.floor(Math.random() * 16);
    const value = symbol === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getStoredDeviceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(DEVICE_STORAGE_KEY);
}

export function setStoredDeviceId(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEVICE_STORAGE_KEY, id);
}

export function clearStoredDeviceId(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DEVICE_STORAGE_KEY);
}
