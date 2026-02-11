import type { PaperColor } from "@/lib/device";

export type DeviceRecord = {
  id: string;
  paperColor: PaperColor;
  createdAt: string;
};

export type ImageRecord = {
  id: string;
  imageUrl: string;
  uploadedAt: string;
};

export type LetterRecord = {
  id: string;
  authorDeviceId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
  isFinished: boolean;
  paperColor: PaperColor;
  images: ImageRecord[];
};

export type LetterListResponse = {
  items: LetterRecord[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  years: number[];
};
