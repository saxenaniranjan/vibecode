import type { Device, Image, Letter } from "@prisma/client";

export type LetterWithRelations = Letter & {
  author: Device;
  images: Image[];
};

export function serializeLetter(record: LetterWithRelations) {
  return {
    id: record.id,
    authorDeviceId: record.authorDeviceId,
    content: record.content,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    isBookmarked: record.isBookmarked,
    isFinished: record.isFinished,
    paperColor: record.author.paperColor,
    images: record.images
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        uploadedAt: image.uploadedAt.toISOString(),
      })),
  };
}
